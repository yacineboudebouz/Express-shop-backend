const express = require("express");
const { login, register, getUserData } = require("./../controllers/auth");
const auth = require("./../middlewares/auth");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/getUserData", auth, getUserData);

module.exports = authRouter;
