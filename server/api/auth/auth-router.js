const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const Users = require("../users/users-model");

router.post("/register", async (req, res) => {
  const { username, password: plainPassword } = req.body;

  const password = await bcryptjs.hash(plainPassword, 10);

  try {
    const response = await Users.addUser({ username, password });
    console.log("Created new user", response);
  } catch (error) {
    console.log(error);
    return res.json({ status: "error" });
  }

  res.json({ status: "ok" });
});

module.exports = router;
