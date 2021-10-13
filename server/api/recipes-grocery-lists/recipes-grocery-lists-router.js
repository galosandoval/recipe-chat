const router = require("express").Router();
const RecipesGroceryLists = require("./recipes-grocery-lists-model");

router.get("/", (_req, res) => {
  RecipesGroceryLists.findRecipesAndGroceryLists()
    .then((recipesAndGroceryLists) => {
      res.status(200).json({ recipesAndGroceryLists });
    })
    .catch((err) => {
      res.status(404).json({ message: "Not Found", err });
    });
});

router.get("/recipe/:id", (req, res) => {
  const { id } = req.params;
  RecipesGroceryLists.findRecipesByGroceryListId(id)
    .then((recipes) => {
      res.status(200).json({ recipes });
    })
    .catch((err) => res.status(404).json({ message: "Not Found", err }));
});

router.get("/ingredients/:id", (req, res) => {
  const { id } = req.params;
  RecipesGroceryLists.findIngredientsByGroceryListId(id)
    .then((ingredients) => {
      res.status(200).json({ ingredients });
    })
    .catch((error) => {
      res.status(404).json({ message: "Not Found", error });
    });
});

module.exports = router;
