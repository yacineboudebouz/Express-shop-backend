const connection = require("../db/connexion");

const getAllBooks = async (req, res) => {
  try {
    const getAllBooksQuery = `
    SELECT Books.*, Genres.GenreName
    FROM Books
    JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
    JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
    LEFT JOIN Deals ON Books.BookID = Deals.BookID
    WHERE Deals.DealID IS NULL
  `;

    const [books] = await connection.promise().query(getAllBooksQuery);

    const booksWithGenres = books.map((book) => {
      return {
        BookID: book.BookID,
        Title: book.Title,
        Author: book.Author,
        Description: book.Description,
        Price: book.Price,
        ISBN: book.ISBN,
        ImageURL: book.ImageURL,
        Genre: book.GenreName,
      };
    });

    res.json({ books: booksWithGenres });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getBooksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;

    const getBooksByGenreQuery = `
          SELECT Books.*, Genres.GenreName
          FROM Books
          JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
          JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
          WHERE Genres.GenreName = ?
        `;

    const [books] = await connection
      .promise()
      .query(getBooksByGenreQuery, [genre]);

    const booksWithGenres = books.map((book) => {
      return {
        BookID: book.BookID,
        Title: book.Title,
        Author: book.Author,
        Description: book.Description,
        Price: parseFloat(book.Price),
        ISBN: book.ISBN,
        ImageURL: book.ImageURL,
        Genre: book.GenreName, // Add the Genre attribute to each book
      };
    });

    res.status(200).json({ books: booksWithGenres });
  } catch (error) {
    console.error(`Error fetching books by genre ${req.params.genre}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getBook = async (req, res) => {
  try {
    const bookID = req.params.id;

    const getBookByIdQuery = `
          SELECT Books.*, Genres.GenreName
          FROM Books
          JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
          JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
          WHERE Books.BookID = ?
        `;

    const [book] = await connection.promise().query(getBookByIdQuery, [bookID]);

    if (book.length === 0) {
      res.status(404).json({ message: "Book not found" });
    } else {
      // Structure the response to include the book with its associated genre
      const bookWithGenre = {
        BookID: book[0].BookID,
        Title: book[0].Title,
        Author: book[0].Author,
        Description: book[0].Description,
        Price: parseFloat(book[0].Price),
        ISBN: book[0].ISBN,
        ImageURL: book[0].ImageURL,
        Genre: book[0].GenreName, // Add the Genre attribute to the book
      };

      res.json({ ...bookWithGenre });
    }
  } catch (error) {
    console.error(`Error fetching book with ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDeals = async (req, res) => {
  try {
    const getDealsQuery = `
    SELECT Books.*, Genres.GenreName, Deals.DiscountPercentage, (Books.Price * Deals.DiscountPercentage / 100) AS Reduction
    FROM Deals
    JOIN Books ON Deals.BookID = Books.BookID
    JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
    JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
  `;

    const [deals] = await connection.promise().query(getDealsQuery);

    const dealsWithBookAttributes = deals.map((deal) => {
      return {
        BookID: deal.BookID,
        Title: deal.Title,
        Author: deal.Author,
        Description: deal.Description,
        Price: parseFloat(deal.Price),
        ISBN: deal.ISBN,
        ImageURL: deal.ImageURL,
        DiscountPercentage: parseFloat(deal.DiscountPercentage),
        Reduction: (deal.Price * deal.DiscountPercentage) / 100,
        Genre: deal.GenreName,
      };
    });

    res.json({ deals: dealsWithBookAttributes });
  } catch (error) {
    console.error("Error fetching deals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRandomBooks = async (req, res) => {
  try {
    const getRandomBooksQuery = `
    SELECT Books.*, Genres.GenreName
    FROM Books
    JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
    JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
    LEFT JOIN Deals ON Books.BookID = Deals.BookID
    WHERE Deals.DealID IS NULL
    ORDER BY RAND()
    LIMIT 5
  `;

    const [randomBooks] = await connection.promise().query(getRandomBooksQuery);

    // Structure the response to include each random book with its associated genre
    const randomBooksWithGenres = randomBooks.map((book) => {
      return {
        BookID: book.BookID,
        Title: book.Title,
        Author: book.Author,
        Description: book.Description,
        Price: parseFloat(book.Price), // Convert to double if necessary
        ISBN: book.ISBN,
        ImageURL: book.ImageURL,
        Genre: book.GenreName, // Add the Genre attribute to the book
      };
    });

    res.json({ randomBooks: randomBooksWithGenres });
  } catch (error) {
    console.error("Error fetching random books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchBook = async (req, res) => {
  try {
    const query = req.params.query;

    // SQL query for searching books by title and author with genre information
    const searchBooksQuery = `
      SELECT Books.*, Genres.GenreName
      FROM Books
      JOIN BooksGenres ON Books.BookID = BooksGenres.BookID
      JOIN Genres ON BooksGenres.GenreID = Genres.GenreID
      WHERE
        (Title LIKE ? OR Author LIKE ?)
    `;

    const [books] = await connection
      .promise()
      .query(searchBooksQuery, [`%${query}%`, `%${query}%`]);

    const myBooks = books.map((book) => {
      return {
        ...book,
        Genre: book.GenreName,
        Price: parseFloat(book.Price),
      };
    });

    res.json({ myBooks });
  } catch (error) {
    console.error("Error searching for books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const insertBook = async (req, res) => {
  try {
    const { title, author, price, genreId, description, imageUrl } = req.body;

    // Check if the genre exists
    const genreExistsQuery = "SELECT * FROM Genres WHERE GenreID = ?";
    const [genreExists] = await connection
      .promise()
      .query(genreExistsQuery, [genreId]);

    if (genreExists.length === 0) {
      return res.status(404).json({ message: "Genre not found" });
    }

    // Insert the book into the Books table
    const insertBookQuery =
      "INSERT INTO Books (Title, Author, Price, Description, ImageUrl, ISBN) VALUES (?, ?, ?, ?, ?, ?)";
    const [insertBookResult] = await connection
      .promise()
      .query(insertBookQuery, [
        title,
        author,
        price,
        description,
        imageUrl,
        "99666564664",
      ]);

    const bookId = insertBookResult.insertId;

    // Insert the book-genre relationship into the BooksGenres table
    const insertBookGenreQuery =
      "INSERT INTO BooksGenres (BookID, GenreID) VALUES (?, ?)";
    await connection.promise().query(insertBookGenreQuery, [bookId, genreId]);

    res.json({ message: "Book inserted successfully" });
  } catch (error) {
    console.error("Error inserting book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllBooks,
  getBooksByGenre,
  getBook,
  getDeals,
  getRandomBooks,
  searchBook,
  insertBook,
};
