const express = require("express");
const connection = require("./db/connexion");
const authRouter = require("./routes/auth");
const bookRouter = require("./routes/book");
const orderRouter = require("./routes/order");
const adminRouter = require("./routes/admin");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/book", bookRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
    connection();
  } catch (error) {
    console.log(error);
  }
};

//fff
start();
