const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `SELECT * FROM book
    WHERE book_id=${bookId};`;
  const book = await db.get(getBookQuery);
  response.send(book);
});
//Add  Book API
app.post("/books/", async (request, response) => {
  const addBook = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = addBook;
  const insertBook = `INSERT INTO book(title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(insertBook);
  //console.log(dbResponse);    lastID:41
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});
//update Book API
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const update = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = update;

  const updateBook = `UPDATE book SET title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBook);
  response.send("Book Updated Successfully");
});
//Delete Book API
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBook = `DELETE FROM book WHERE book_id=${bookId};`;
  await db.run(deleteBook);
  response.send("Book Deleted Successfully");
});
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const authorBooks = `SELECT * FROM book WHERE author_id=${authorId};`;
  const allBooksOfAuthor = await db.all(authorBooks);
  response.send(allBooksOfAuthor);
});
