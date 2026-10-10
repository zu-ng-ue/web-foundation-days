# TicketHub System Design

## 1. Requirements

### Functional Requirements
*   Users can browse events and view available seats.
*   Users can temporarily hold a seat to prevent others from buying it during checkout.
*   Users can pay for held seats to finalize the purchase.
*   Users can view their purchased tickets.
*   The system must support a "big sale" where 200,000 people try to buy 20,000 seats in 10 minutes.

### Non-Functional Requirements
*   **Speed:** Low latency for viewing seats and completing purchases. The system must remain responsive under heavy load.
*   **Correctness:** Strictly prevent double-booking (two users buying the same seat).
*   **Fairness:** First-come, first-served, with mechanisms to prevent bots from snatching all tickets instantly.
*   **Scalability:** Handle 200,000 concurrent users during a peak sale without crashing.
*   **Availability:** 99.99% uptime. Users should not lose held seats due to server crashes.

## 2. Estimates

### Normal Traffic (Given: 50,000 visitors/day, 10 pages/viewed, 5,000 tickets sold/day)
*   **Page Views:** 50,000 visitors * 10 pages = 500,000 views/day.
*   **Read Requests per second:** 500,000 / 86,400 seconds ≈ **5.8 reads/sec**.
*   **Write Requests (Purchases) per second:** 5,000 tickets / 86,400 seconds ≈ **0.06 writes/sec**.
*   *Conclusion:* Normal traffic is extremely light. A single database could easily handle this.

### Big Sale Peak (Given: 200,000 people try to buy 20,000 seats in 10 minutes)
*   **Concurrent Users:** 200,000 users hitting the site within 600 seconds.
*   **Write Requests per second:** 20,000 seats / 600 seconds ≈ **33 write requests/sec**.
*   **Read Requests per second (Seat browsing):** Assuming each user refreshes the seat map 5 times in 10 minutes, that is 200,000 * 5 / 600 ≈ **1,666 reads/sec**.
*   *Comparison:* The "Big Sale" generates approximately 280 times more read traffic and 550 times more write traffic than a normal day. The system must be designed to handle this massive spike without failing.

## 3. API Design

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| GET | `/events` | Browse all events | 200 OK |
| GET | `/events/{id}/seats` | View available seats for an event | 200 OK |
| POST | `/seats/hold` | Temporarily hold a seat (5 min) for the user | 200 OK |
| POST | `/orders` | Pay for held seats and finalize purchase | 201 Created |
| GET | `/users/{id}/tickets` | View user's purchased tickets | 200 OK |

## 4. Data Model

### Tables (At least 4)
1.  **users:** `id` (PK), `email` (Unique), `name`.
2.  **events:** `id` (PK), `name`, `date`, `venue`.
3.  **seats:** `id` (PK), `event_id` (FK), `seat_number`, `status` (available, held, sold), `price`.
4.  **orders:** `id` (PK), `user_id` (FK), `event_id` (FK), `total_amount`, `status` (pending, paid, failed).
5.  **tickets:** `id` (PK), `order_id` (FK), `seat_id` (FK), `qr_code`.

### Relationships
*   **One-to-Many:** A single User can have many Orders. A single Event can have many Seats.
*   **Many-to-Many (Resolved):** A User buys many Seats (through Orders). The `tickets` table connects Orders to specific Seats.

## 5. Preventing Double-Booking
Double-booking occurs when two users attempt to buy the exact same seat simultaneously. This is prevented using a combination of **Database Transactions** and **Distributed Locks**:

1.  **Redis Distributed Lock:** When a user clicks "Hold Seat", the API attempts to acquire a lock in Redis specific to that `seat_id`. If it fails, the user is immediately told the seat is unavailable. This stops 99% of traffic from hitting the database.
2.  **Database Constraints:** A `UNIQUE(event_id, seat_id)` constraint is placed on the `tickets` table. This makes it physically impossible for the database to store two tickets for the same seat.
3.  **ACID Transactions:** When the user pays, the API starts a database transaction. It runs `SELECT ... FOR UPDATE` on the seat row. This locks the row, checks if it is still "available", updates it to "sold", and creates the order. If any step fails, the transaction rolls back. The row lock ensures that only one transaction can modify that specific seat at a time.

## 6. Architecture

```text
[Client (Browser)]
       |
       v
[Load Balancer] (Distributes traffic)
       |
       v
[App Servers (2+)] <---> [Redis Cache & Lock Manager]
       |                              ^
       |                              |
       v                              v
[Primary Database (Writes)] ---> [Read Replica (Reads)]
       |
       v
[ Queue ] ---> [ Worker (Generates PDF tickets & sends emails) ]
