# SnapShare Scaling Plan

## 1. Assumptions
*   **Total Registered Users:** 10,000,000
*   **Daily Active Users (DAU):** 10% of registered users = 1,000,000 users
*   **User Activity:** Each active user uploads 1 photo per day and views 50 feed pages per day.
*   **Photo Size:** Average 2 MB per photo.
*   **Thumbnail Size:** Average 50 KB per photo.

## 2. Estimates

### Daily Active Users (DAU)
*   \( 10,000,000 \times 0.10 = \mathbf{1,000,000} \text{ users} \)

### Uploads Per Second
*   **Average:** \( 1,000,000 \text{ photos} / 86,400 \text{ seconds} \approx \mathbf{12 \text{ photos/sec}} \)
*   **Peak (5x average):** \( 12 \times 5 = \mathbf{60 \text{ photos/sec}} \)

### Feed Views Per Second
*   **Average:** \( (1,000,000 \text{ users} \times 50 \text{ views}) / 86,400 \text{ seconds} \approx \mathbf{579 \text{ views/sec}} \)
*   **Peak (5x average):** \( 579 \times 5 = \mathbf{2,895 \text{ views/sec}} \)

### Photo Storage Per Year
*   **Daily Photo Storage:** \( 1,000,000 \times 2 \text{ MB} = 2,000,000 \text{ MB} = 2 \text{ TB} \)
*   **Daily Thumbnail Storage:** \( 1,000,000 \times 50 \text{ KB} = 50,000,000 \text{ KB} = 50 \text{ GB} \)
*   **Total Daily Storage:** \( 2 \text{ TB} + 50 \text{ GB} = 2.05 \text{ TB} \)
*   **Annual Storage:** \( 2.05 \text{ TB} \times 365 = \mathbf{748.25 \text{ TB per year}} \)

## 3. System Classification: Read-Heavy
SnapShare is a **Read-Heavy** system. The average read traffic (~579 requests/sec) is roughly 48 times higher than the write traffic (~12 requests/sec), and this disparity grows even larger during peak hours. 
**Implications for Design:** The architecture must prioritize fast data retrieval and high concurrency. This means using aggressive caching (Redis), leveraging Content Delivery Networks (CDNs), and utilizing database read replicas to prevent the primary database from being overwhelmed by read requests.

## 4. Why Photos Should Not Be Stored Inside the Database
Photos should **not** be stored inside the relational database (as BLOBs) because they are large (2 MB) and would cause the database to balloon to hundreds of terabytes within a year. This would severely degrade query performance, make backups incredibly slow, and scale poorly. Instead, photos should be stored in **Object Storage** (like Amazon S3 or Google Cloud Storage), which is specifically designed for large, unstructured files. The database should only store the metadata (like the user ID, timestamp, and the URL/path to the photo in object storage).

## 5. Architecture Diagram (Text)

```text
[User Device] 
      |
      v
   [ CDN ] <--- (Caches photos globally)
      |
      v
[Load Balancer] 
      |
      v
[ App Servers ] <---> [ Cache (Redis) ]
      |     |
      |     +---> [ Database (Master) ] ---> [ Read Replica ]
      |                 (Metadata)            (Reads)
      |
      +---> [ Object Storage ] <--- [ Worker (Thumbnail Creator) ]
                 (Photos)             ^
                                      |
                                 [ Queue ]

## 6. Component Explanations (One Sentence Each)
*   **CDN:** Caches static assets (photos) at edge locations worldwide to serve them to users with minimal latency.
*   **Load Balancer:** Distributes incoming network traffic across multiple app servers to ensure high availability and prevent any single server from being overwhelmed.
*   **App Servers:** Execute the core application logic, handling user authentication, feed generation, and API requests.
*   **Cache (Redis):** Stores frequently accessed data (like recent feeds or user sessions) in memory to drastically reduce the load on the database.
*   **Database (Master):** Stores relational metadata such as user accounts, follow relationships, and photo URLs.
*   **Read Replica:** Offloads read queries (like viewing feeds) from the master database, allowing the system to scale horizontally for read-heavy traffic.
*   **Object Storage:** Provides scalable, durable, and cost-effective storage for the actual photo and thumbnail files.
*   **Queue:** Buffers incoming upload events to handle sudden spikes in traffic asynchronously.
*   **Worker:** Consumes jobs from the queue to perform background tasks, specifically generating thumbnails from the uploaded photos.

## 7. Step-by-Step Upload Flow
1.  **Request Upload URL:** The user's device sends a request to the App Server to upload a photo.
2.  **Generate Pre-signed URL:** The App Server validates the user's authentication, then generates a secure, pre-signed URL that grants temporary upload access to the Object Storage.
3.  **Direct Upload:** The user's device uploads the 2 MB photo directly to Object Storage using the pre-signed URL. This bypasses the App Server to save bandwidth and processing power.
4.  **Queue Notification:** Once the upload is complete, Object Storage triggers an event that places a message onto the Queue.
5.  **Worker Processing:** A Worker picks up the job from the Queue, downloads the original photo, resizes it to create a 50 KB thumbnail, and uploads the thumbnail back to Object Storage.
6.  **Metadata Update:** The Worker updates the Database with the final URLs of both the original photo and the generated thumbnail. The photo is now ready to appear in feeds.

## 8. Trade-offs
*   **Cost vs. Latency (CDN usage):** Using a CDN significantly reduces latency for users globally and reduces bandwidth costs on the origin servers. However, it adds an ongoing operational expense for the CDN service itself. The trade-off is paying more money for a much faster and more reliable user experience.
*   **Consistency vs. Availability (Read Replicas):** Using read replicas improves read scalability and availability. However, it introduces eventual consistency. A user who just uploaded a photo might not see it immediately in their feed if their request is routed to a replica that hasn't synced with the master database yet. The trade-off is high scalability at the cost of strict immediate consistency.
*   **Complexity vs. Scalability (Queues and Workers):** Offloading thumbnail generation to a queue and background workers prevents the app servers from blocking during uploads and handles traffic spikes gracefully. However, it significantly increases the architectural complexity (more moving parts, potential points of failure, harder to debug). The trade-off is easier maintainability in exchange for a system that can scale to millions of users.
