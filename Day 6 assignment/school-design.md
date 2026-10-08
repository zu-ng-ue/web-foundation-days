# School Database Design

## Table Explanations
*   **students:** Stores the personal information of the students. It includes a unique `id` (Primary Key), `name`, and a `UNIQUE` `email` address to prevent duplicate accounts.
*   **courses:** Stores the available courses offered by the school. It includes a unique `id` (Primary Key) and the `title` of the course.
*   **enrollments:** This is a join table that links students to courses. It contains a `student_id` (Foreign Key), `course_id` (Foreign Key), and the `grade` the student received. It also has a `UNIQUE(student_id, course_id)` constraint to prevent a student from enrolling in the same course twice.

## Relationships
*   **One-to-Many:** A single student can have many enrollments (one-to-many), and a single course can have many enrollments (one-to-many).
*   **Many-to-Many:** The relationship between `students` and `courses` is many-to-many (a student takes many courses, and a course has many students). 
*   **Why a Join Table is Needed:** Relational databases cannot directly store many-to-many relationships. The `enrollments` table acts as an intermediary (a join table) to break the many-to-many relationship into two one-to-many relationships. It also provides a place to store data that belongs exclusively to the relationship itself—in this case, the `grade`.

## Recommended Index
I would add an index on the `student_id` and `course_id` columns in the `enrollments` table:
```sql
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
