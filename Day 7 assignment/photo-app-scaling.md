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
