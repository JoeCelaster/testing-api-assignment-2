const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const booksFile = "books.json";

// Read books from file
const readBooks = () => {
    if (!fs.existsSync(booksFile)) return [];
    const data = fs.readFileSync(booksFile);
    return JSON.parse(data);
};

// Write books to file
const writeBooks = (books) => {
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
};

// 📌 Create a new book (POST /books)
app.post("/books", (req, res) => {
    const { book_id, title, author, genre, year, copies } = req.body;
    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: "All book fields are required." });
    }

    let books = readBooks();
    if (books.find(book => book.book_id === book_id)) {
        return res.status(400).json({ error: "Book with this ID already exists." });
    }
    
    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    writeBooks(books);
    res.status(201).json(newBook);
});

// 📌 Retrieve all books (GET /books)
app.get("/books", (req, res) => {
    const books = readBooks();
    res.json(books);
});

// 📌 Retrieve a specific book by ID (GET /books/:id)
app.get("/books/:id", (req, res) => {
    const books = readBooks();
    const book = books.find(book => book.book_id === req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found." });
    res.json(book);
});

// 📌 Update book details (PUT /books/:id)
app.put("/books/:id", (req, res) => {
    let books = readBooks();
    const bookIndex = books.findIndex(book => book.book_id === req.params.id);
    if (bookIndex === -1) return res.status(404).json({ error: "Book not found." });

    books[bookIndex] = { ...books[bookIndex], ...req.body };
    writeBooks(books);
    res.json(books[bookIndex]);
});

// 📌 Delete a book (DELETE /books/:id)
app.delete("/books/:id", (req, res) => {
    let books = readBooks();
    const filteredBooks = books.filter(book => book.book_id !== req.params.id);
    
    if (filteredBooks.length === books.length) {
        return res.status(404).json({ error: "Book not found." });
    }
    
    writeBooks(filteredBooks);
    res.json({ message: "Book deleted successfully." });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
