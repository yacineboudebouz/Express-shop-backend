const express = require("express");
const {
  login,
  register,
  getUserData,
  updateUser,
} = require("./../controllers/auth");
const auth = require("./../middlewares/auth");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/getuserdata", auth, getUserData);
authRouter.post("/updateuser/:userId", updateUser);

module.exports = authRouter;
