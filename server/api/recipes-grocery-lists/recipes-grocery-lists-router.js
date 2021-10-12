const router = require("express").Router();
const RecipesGroceryLists = require("./recipes-grocery-lists-model");

router.get("/", (_req, res) => {
  RecipesGroceryLists.findRecipesAndGroceryLists()
    .then((recipesAndGroceryLists) => {
      res.status(200).json({ recipesAndGroceryLists });
    })
    .catch((err) => {
      res.status(404).json("Not Found", err);
    });
});

module.exports = router;
