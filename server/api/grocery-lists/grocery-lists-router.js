const router = require("express").Router();

const GroceryLists = require("./grocery-lists-model");

router.get("/", (req, res) => {
  GroceryLists.findGroceryLists()
    .then((groceryLists) => {
      res.status(200).json({ groceryLists });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

module.exports = router;
