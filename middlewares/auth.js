const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ message: "No auth token found" });
    const verified = jwt.verify(token, "SecretKey");

    if (!verified)
      return res.status(401).json({ message: "Token verification failed" });

    req.user = verified.id;
    req.token = token;
    next();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = auth;
