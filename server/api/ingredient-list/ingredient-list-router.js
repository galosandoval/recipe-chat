const router = require("express").Router();
const IngredientList = require("./ingredient-list-model");

router.get("/:id", (req, res) => {
  const { id } = req.params;
  IngredientList.findIngredientsListById(id)
    .then((ingredientsList) => {
      res.status(200).json({ ingredientsList });
    })
    .catch((err) => {
      res.status(400).json("IngredientList not found with id " + id);
    });
});

module.exports = router;
