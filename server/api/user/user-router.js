const router = require("express").Router();

const User = require("./user-model");

router.get("/", (req, res) => {
  User.findAllUsers()
    .then((members) => {
      res.status(200).json({ members });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  User.findUserById(id)
    .then((member) => {
      res.status(200).json({ member });
    })
    .catch((err) => {
      res.status(400).json("Member not found by id " + id);
    });
});

router.get('/:id/ingredient-lists', (req, res) => {

})

module.exports = router;
