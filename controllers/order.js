const connection = require("../db/connexion");
const placeOrder = async (req, res) => {
  try {
    const { userId, shippingAddress, bookIds } = req.body;

    // Check if the user exists
    const userExistsQuery = "SELECT * FROM Users WHERE UserID = ?";
    const [userExists] = await connection
      .promise()
      .query(userExistsQuery, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if all books exist
    const booksExistQuery = "SELECT * FROM Books WHERE BookID IN (?)";
    const [existingBooks] = await connection
      .promise()
      .query(booksExistQuery, [bookIds]);

    if (existingBooks.length !== bookIds.length) {
      return res.status(404).json({ message: "One or more books not found" });
    }

    // Calculate total amount based on the selected books
    const totalAmountQuery =
      "SELECT SUM(Price) AS TotalAmount FROM Books WHERE BookID IN (?)";
    const [totalAmountResult] = await connection
      .promise()
      .query(totalAmountQuery, [bookIds]);

    const totalAmount = totalAmountResult[0].TotalAmount || 0;

    // Create an order
    const createOrderQuery =
      "INSERT INTO Orders (UserID, TotalAmount, ShippingAddress, CreatedAt) VALUES (?, ?, ?, Now())";
    const [orderResult] = await connection
      .promise()
      .query(createOrderQuery, [userId, totalAmount, shippingAddress]);

    const orderId = orderResult.insertId;

    // Add order items
    const addOrderItemsQuery =
      "INSERT INTO OrderItems (OrderID, BookID) VALUES (?, ?)";
    for (const bookId of bookIds) {
      await connection.promise().query(addOrderItemsQuery, [orderId, bookId]);
    }

    res.json({ message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if the user exists
    const userExistsQuery = "SELECT * FROM Users WHERE UserID = ?";
    const [userExists] = await connection
      .promise()
      .query(userExistsQuery, [userId]);

    if (userExists.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve user orders with details
    const getUserOrdersQuery = `
      SELECT 
        Orders.OrderID,
        Orders.TotalAmount,
        Orders.ShippingAddress,
        Orders.CreatedAt AS OrderDate,
        GROUP_CONCAT(Books.Title ORDER BY OrderItems.OrderItemID SEPARATOR ', ') AS BookTitles
      FROM Orders
      JOIN OrderItems ON Orders.OrderID = OrderItems.OrderID
      JOIN Books ON OrderItems.BookID = Books.BookID
      WHERE Orders.UserID = ?
      GROUP BY Orders.OrderID
      ORDER BY Orders.CreatedAt DESC;
    `;

    const [userOrders] = await connection
      .promise()
      .query(getUserOrdersQuery, [userId]);

    res.json({ userOrders });
  } catch (error) {
    console.error("Error retrieving user orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { placeOrder, getUserOrders };
