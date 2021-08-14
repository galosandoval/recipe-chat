const router = require("express").Router();
const Ingredient = require("./ingredient-model");

router.get("/", (req, res) => {
  Ingredient.findIngredients()
    .then((ingredients) => {
      res.status(200).json({ ingredients });
    })
    .catch((err) => {
      res.status(400).json("Ingredients not found");
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  Ingredient.findIngredientById(id)
    .then((ingredients) => {
      res.status(200).json({ ingredients });
    })
    .catch((err) => {
      res.status(400).json("Ingredients not found");
    });
});

module.exports = router;
