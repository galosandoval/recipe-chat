const router = require("express").Router();

const User = require("./users-model");

router.get("/", (_req, res) => {
  User.findUsers()
    .then((users) => {
      res.status(200).json({ users });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  User.findUserById(id)
    .then((user) => {
      res.status(200).json({ user });
    })
    .catch((err) => {
      res.status(400).json("Member not found by id " + id);
    });
});

module.exports = router;
