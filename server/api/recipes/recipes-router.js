const router = require("express").Router();
const Recipes = require("./recipes-model");

router.get("/", (req, res) => {
  Recipes.findRecipes()
    .then((allRecipes) => {
      res.status(200).json({ allRecipes });
    })
    .catch((err) => {
      res.status(404).json("Ingredients not found");
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  Recipes.findIngredientsByRecipeId(id)
    .then((recipeIngredients) => {
      res.status(200).json({ recipeIngredients });
    })
    .catch((err) => {
      res.status(404).json("IngredientList not found with id " + id, err);
    });
});

router.get("/user/:id", (req, res) => {
  const { id } = req.params;
  Recipes.findRecipesByUserId(id)
    .then((recipes) => {
      res.status(200).json({ recipes });
    })
    .catch((error) => {
      res.status(500).json(error);
    });
});

module.exports = router;
