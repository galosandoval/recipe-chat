const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("../users/users-model");

router.post("/register", async (req, res) => {
  const { username, password: plainPassword } = req.body;

  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }
  if (!plainPassword || typeof plainPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }
  if (plainPassword.length < 6) {
    return res.json({ status: "error", error: "Invalid password: must be at least 6 characters" });
  }

  const password = await bcryptjs.hash(plainPassword, 10);

  try {
    const response = await Users.addUser({ username, password });
    console.log("Created new user", response);
  } catch (error) {
    console.log("BE TRUE", error.code === "SQLITE_CONSTRAINT");
    if (error.code === "SQLITE_CONSTRAINT") {
      // dublictate username

      return res.json({ status: "error", error: "Username already exists" });
    } else {
      // otherwise something else has gone wrong
      throw error;
    }
  }

  res.json({ status: "ok" });
});

module.exports = router;
