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

router.get("/gl/user/:id", (req, res) => {
  const { id } = req.params;
  RecipesGroceryLists.findGroceryListIdsByUserId(id)
    .then((groceryLists) => {
      res.status(200).json(groceryLists);
    })
    .catch((error) => {
      res.status(404).json({ message: "Not Found", error });
    });
});

router.get("/user/:id", (req, res) => {
  const { id } = req.params;
  RecipesGroceryLists.findRecipesAndGroceryListsByUserId(id)
    .then((list) => {
      res.status(200).json({ list });
    })
    .catch((error) => {
      res.status(404).json({ message: "Not found", error });
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

router.post("/", (req, res) => {
  const { body } = req;
  RecipesGroceryLists.addRecipeGroceryList(body)
    .then((recipesGroceryList) => {
      res.status(201).json({ recipesGroceryList });
    })
    .catch((error) => res.status(500).json({ message: error }));
});

router.delete("/grocerylist/:id", (req, res) => {
  const { id } = req.params;
  RecipesGroceryLists.deleteRecipeGroceryListByGrocerylistId(id)
    .then((deletedItems) => {
      res.status(200).json(deletedItems);
    })
    .catch((error) => res.status(404).json({ message: "Not found", error }));
});

router.put("/grocerylist/:id", (req, res) => {
  const { id } = req.params;
  const { body } = req;

  RecipesGroceryLists.editRecipeGrocerylistByGrocerylistId(id, body)
    .then((editedItems) => {
      res.status(200).json(editedItems);
    })
    .catch((error) => res.status(500).json(error));
});

module.exports = router;
