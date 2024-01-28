const connection = require("./../db/connexion");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const register = async (req, res) => {
  try {
    // heda njibo data mn request user li y7ethom
    const { username, password, email, address } = req.body;
    // heda query nchofo ide heda email wla username rahom yexistiw fe database
    const checkUserQuery =
      "SELECT * FROM Users WHERE Username = ? OR Email = ?";
    const existingUser = await connection
      .promise()
      .query(checkUserQuery, [username, email]);

    if (existingUser[0].length > 0) {
      // ida yegsisti ab3t error
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    // function hash bayna for security reasons
    const hashedPassword = await bcrypt.hash(password, 10);
    // njibo userid unique mna
    const userID = uuidv4();
    // query bah npostiw user fe database
    const insertUserQuery =
      "INSERT INTO Users (UserID, Username, Password, Email,  Address, ProfilePictureURL, isAdmin) VALUES (?, ?, ?,  ?, ?,?,false)";
    await connection
      .promise()
      .query(insertUserQuery, [
        userID,
        username,
        hashedPassword,
        email,
        "",
        "",
      ]);
    // nbe3toi response bli sayii
    res.status(201).json({ message: "Registration successful" });
  } catch (e) {
    res.status(500).json({ message: e.toString() });
  }
};

const login = async (req, res) => {
  try {
    const { identity, password } = req.body;
    const getUserQuery = "SELECT * FROM Users WHERE Username = ? OR Email = ?";
    const user = await connection
      .promise()
      .query(getUserQuery, [identity, identity]);
    if (user[0].length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid username, email, or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0][0].Password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid username, email, or password" });
    }
    const token = jwt.sign({ id: user[0][0].UserID }, "SecretKey");
    res.status(200).json({ ...user[0][0], token: token });
  } catch (e) {
    res.status(500).json({ message: e.toString });
  }
};

const getUserData = async (req, res) => {
  try {
    const getUserQuery = "SELECT * FROM Users WHERE UserID = ? ";
    const user = await connection.promise().query(getUserQuery, [req.user]);
    if (user[0].length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid username, email, or password" });
    }
    res.status(200).json({ ...user[0][0], token: req.token });
  } catch (e) {
    res.status(500).json({ message: e.toString });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { username, email, address } = req.body;

    // Check if the new username is in use by other users
    const usernameInUseQuery = `
      SELECT UserID FROM Users WHERE Username = ? AND UserID != ?
    `;
    const [usernameInUse] = await connection
      .promise()
      .query(usernameInUseQuery, [username, userId]);

    // Check if the new email is in use by other users
    const emailInUseQuery = `
      SELECT UserID FROM Users WHERE Email = ? AND UserID != ?
    `;
    const [emailInUse] = await connection
      .promise()
      .query(emailInUseQuery, [email, userId]);

    // If either the new username or email is in use, return an error
    if (usernameInUse.length > 0) {
      return res.status(400).json({ message: "Username is already in use" });
    }

    if (emailInUse.length > 0) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Update user information
    const updateUserQuery = `
      UPDATE Users
      SET Username = ?, Email = ?, Address = ?
      WHERE UserID = ?
    `;
    await connection
      .promise()
      .query(updateUserQuery, [username, email, address, userId]);

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { login, register, getUserData, updateUser };
