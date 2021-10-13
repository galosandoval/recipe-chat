const router = require("express").Router();

const { validateUser } = require("../users/users-middleware");
const { validateGroceryListId } = require("./grocery-lists-middleware");
const GroceryLists = require("./grocery-lists-model");

router.get("/", (_req, res) => {
  GroceryLists.findGroceryLists()
    .then((groceryLists) => {
      res.status(200).json({ groceryLists });
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  GroceryLists.findGroceryListById(id)
    .then((groceryList) => res.status(200).json({ groceryList }))
    .catch((err) => {
      res.status(500).json({ error: err.message });
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

//TODO: Everytime a new grocery list is made, recipes-grocery-lists gets a post request
router.post("/", validateUser, (req, res) => {
  const list = req.body;
  GroceryLists.addGroceryList(list)
    .then((groceryListId) => {
      res.status(201).json({ groceryListId });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.put("/:id", validateGroceryListId, (req, res) => {
  const { id } = req.params;
  const { body } = req;

  GroceryLists.updateGroceryList(id, body)
    .then((updatedGroceryList) => {
      res
        .status(200)
        .json({ message: `Grocery list with id ${id} successfully updated`, updatedGroceryList });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.delete("/:id", validateGroceryListId, (req, res) => {
  const { id } = req.params;

  GroceryLists.deleteGroceryList(id)
    .then((deletedGroceryList) => {
      res.status(200).json({ deletedGroceryList });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;
