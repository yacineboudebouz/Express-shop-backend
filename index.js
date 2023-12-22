const express = require("express");
const connection = require("./db/connexion");
const authRouter = require("./routes/auth");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(authRouter);
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
