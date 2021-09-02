const Recipes = require("../recipes/recipes-model");
const { findIngredientById } = require("./ingredients-model");

const validateRecipe = (req, res, next) => {
  const id = req.body[0]["recipe-id"];

  Recipes.findRecipeById(id).then((recipe) => {
    if (recipe.length > 0) next();
    else res.status(404).json({ error: `recipe with id: ${id} not found` });
  });
};

const validateIngredient = (req, res, next) => {
  const { id } = req.params;

  findIngredientById(id).then((ingredient) => {
    if (ingredient.length > 0) next();
    else res.status(404).json({ error: `ingredient with id ${id} not found` });
  });
};

module.exports = {
  validateRecipe,
  validateIngredient
};
