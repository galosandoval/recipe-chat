const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  const secret = process.env.JWT_TOKEN || "is it secret, is it safe?";

  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ error: "Token invalid: expired or modified" });
      } else {
        req.jwt = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};
