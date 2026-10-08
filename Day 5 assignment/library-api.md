# Library API Documentation

## Books Resource

### Endpoints

#### 1. List all books
* **Method:** `GET`
* **Path:** `/books`
* **Description:** Retrieves a list of all books in the library.
* **Success Status Code:** `200 OK`

#### 2. Get a single book
* **Method:** `GET`
* **Path:** `/books/:id`
* **Description:** Retrieves details for a specific book by its ID.
* **Success Status Code:** `200 OK`

#### 3. Create a new book
* **Method:** `POST`
* **Path:** `/books`
* **Description:** Adds a new book to the library collection.
* **Example Request Body:**
  ```json
  {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565"
  }
