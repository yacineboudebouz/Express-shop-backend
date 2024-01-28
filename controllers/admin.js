const connection = require("../db/connexion");

const postBook = async (req, res) => {
  try {
    const { title, author, price, genreId, description, imageUrl } = req.body;
    const userId = req.user.id;

    // Check if the user is an admin
    const isAdminQuery = "SELECT isAdmin FROM Users WHERE UserID = ?";
    const [user] = await connection.promise().query(isAdminQuery, [userId]);

    if (!user || user.length === 0 || user[0].isAdmin != 1) {
      return res.status(403).json({ message: "Only admins can post books" });
    }

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
      "INSERT INTO Books (Title, Author, Price, Description, ImageUrl) VALUES (?, ?, ?, ?, ?)";
    const [insertBookResult] = await connection
      .promise()
      .query(insertBookQuery, [title, author, price, description, imageUrl]);

    const bookId = insertBookResult.insertId;

    // Insert the book-genre relationship into the BooksGenres table
    const insertBookGenreQuery =
      "INSERT INTO BooksGenres (BookID, GenreID) VALUES (?, ?)";
    await connection.promise().query(insertBookGenreQuery, [bookId, genreId]);

    res.json({ message: "Book posted successfully" });
  } catch (error) {
    console.error("Error posting book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user;
    console.log(userId);
    // Check if the user is an admin
    const isAdminQuery = "SELECT isAdmin FROM Users WHERE UserID = ?";
    const [user] = await connection.promise().query(isAdminQuery, [userId]);

    if (!user || user.length === 0 || user[0].isAdmin != 1) {
      return res.status(403).json({ message: "Only admins can delete books" });
    }

    // Check if the book exists
    const bookExistsQuery = "SELECT * FROM Books WHERE BookID = ?";
    const [bookExists] = await connection
      .promise()
      .query(bookExistsQuery, [bookId]);

    if (bookExists.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Delete the book from the Books table
    const deleteBookQuery = "DELETE FROM Books WHERE BookID = ?";
    await connection.promise().query(deleteBookQuery, [bookId]);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id; // Assuming you have a middleware that adds user information to the request

    // Check if the user making the request is an admin
    const isAdminQuery = "SELECT isAdmin FROM Users WHERE UserID = ?";
    const [admin] = await connection.promise().query(isAdminQuery, [adminId]);

    if (!admin || admin.length === 0 || !admin[0].isAdmin) {
      return res.status(403).json({ message: "Only admins can delete users" });
    }

    // Check if the user to be deleted exists
    const userExistsQuery = "SELECT * FROM Users WHERE UserID = ?";
    const [userExists] = await connection
      .promise()
      .query(userExistsQuery, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user from the Users table
    const deleteUserQuery = "DELETE FROM Users WHERE UserID = ?";
    await connection.promise().query(deleteUserQuery, [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { deleteBook, postBook, deleteUser };
