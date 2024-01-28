const express = require("express");
const {
  getAllBooks,
  getBooksByGenre,
  getBook,
  getDeals,
  searchBook,
  getRandomBooks,
  insertBook,
} = require("./../controllers/book");
const bookRouter = express.Router();

bookRouter.get("/allbooks", getAllBooks);
bookRouter.get("/getbookbygenre/:genre", getBooksByGenre);
bookRouter.get("/getbook/:id", getBook);
bookRouter.get("/getdeals", getDeals);
bookRouter.get("/searchbook/:query", searchBook);
bookRouter.get("/getrandombooks", getRandomBooks);
bookRouter.post("/insertbook", insertBook);

module.exports = bookRouter;
