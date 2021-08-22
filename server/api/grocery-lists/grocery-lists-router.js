const router = require("express").Router();

const GroceryLists = require("./grocery-lists-model");

router.get("/", (_, res) => {
  GroceryLists.findGroceryLists()
    .then((groceryLists) => {
      res.status(200).json({ groceryLists });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.get("/user/:id", (req, res) => {
  const { id } = req.params;
  GroceryLists.findGroceryListsByUserId(id)
    .then((groceryLists) => {
      res.status(200).json({ groceryLists });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.get("/recipes", (_, res) => {
  GroceryLists.findAllRecipesInList()
    .then((groceryListRecipes) => {
      res.status(200).json({ groceryListRecipes });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.get("/recipes/:id", (req, res) => {
  const { id } = req.params;
  GroceryLists.findRecipesWithIngredients(id)
    .then((groceryListRecipes) => {
      res.status(200).json({ groceryListRecipes });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

module.exports = router;
