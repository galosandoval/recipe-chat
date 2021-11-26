const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("../users/users-model");
const { validateBody } = require("./auth-middleware");
const jwt = require("jsonwebtoken");

router.post("/register", validateBody, async (req, res) => {
  const { username, password: plainPassword } = req.body;
  const password = await bcryptjs.hash(plainPassword, 10);

  try {
    const addedUser = await Users.addUser({ username, password });
    const token = makeJwt(addedUser[0]);

    res.status(201).json({ status: "ok", user: addedUser[0], token });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      // duplicate username

      res.json({ status: "error", error: "Username already exists" });
    } else {
      // otherwise something else has gone wrong
      throw error;
    }
  }
});

router.post("/login", validateBody, async (req, res) => {
  const { username, password } = req.body;
  const user = await Users.findUserByUsername(username);
  console.log({ user });
  if ((await bcryptjs.compare(password, user[0].password)) && user[0]) {
    const token = makeJwt(user[0]);
    res.json({ status: "ok", user: user[0], token });
    console.log("signed in");
  } else {
    res.json({ status: "error", error: "Invalid username/password" });
  }
});

function makeJwt(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };

  const secret = process.env.JWT_SECRET || "is it secret, is it safe?";

  const options = {
    expiresIn: "8h"
  };

  return jwt.sign(payload, secret, options);
}

module.exports = router;
