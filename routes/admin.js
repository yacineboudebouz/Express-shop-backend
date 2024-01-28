const express = require("express");
const auth = require("./../middlewares/auth");
const { deleteBook, postBook, deleteUser } = require("./../controllers/admin");

const adminRouter = express.Router();
adminRouter.delete("/deletebook/:bookId", auth, deleteBook);
adminRouter.post("/postbook", auth, postBook);
adminRouter.delete("/deleteuser", auth, deleteUser);
module.exports = adminRouter;
