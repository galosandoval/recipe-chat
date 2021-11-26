const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("../users/users-model");
const { validateBody } = require("./auth-middleware");

router.post("/register", validateBody, async (req, res) => {
  const { username, password: plainPassword } = req.body;
  const password = await bcryptjs.hash(plainPassword, 10);

  try {
    const response = await Users.addUser({ username, password });
    console.log("Created new user", response);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      // duplicate username

      return res.json({ status: "error", error: "Username already exists" });
    } else {
      // otherwise something else has gone wrong
      throw error;
    }
  }

  res.json({ status: "ok" });
});

module.exports = router;
