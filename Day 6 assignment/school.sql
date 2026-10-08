-- 1. Create Tables
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL
);

CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(student_id, course_id) -- Prevents duplicate enrollment
);

-- 2. Insert Sample Data
INSERT INTO students (name, email) VALUES 
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Charlie Brown', 'charlie@example.com');

INSERT INTO courses (title) VALUES 
('Mathematics'),
('Science'),
('History');

INSERT INTO enrollments (student_id, course_id, grade) VALUES 
(1, 1, 'A'), -- Alice in Math
(1, 2, 'B'), -- Alice in Science
(2, 1, 'C'), -- Bob in Math
(3, 3, 'A'), -- Charlie in History
(2, 2, 'B'); -- Bob in Science

-- 3. Five Queries

-- Query 1: All courses for one student (by name)
SELECT c.title 
FROM courses c
JOIN enrollments e ON c.id = e.course_id
JOIN students s ON s.id = e.student_id
WHERE s.name = 'Alice Johnson';

-- Query 2: All students on one course
SELECT s.name 
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id
WHERE c.title = 'Mathematics';

-- Query 3: The number of students per course
SELECT c.title, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id;

-- Query 4: Students who have no enrollments
SELECT s.name 
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
WHERE e.id IS NULL;

-- Query 5: Update an enrollment's grade
UPDATE enrollments 
SET grade = 'A+' 
WHERE student_id = (SELECT id FROM students WHERE name = 'Alice Johnson') 
  AND course_id = (SELECT id FROM courses WHERE title = 'Mathematics');

-- Verify the update
SELECT * FROM enrollments WHERE student_id = 1 AND course_id = 1;
