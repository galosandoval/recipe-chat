const Recipes = require("./recipes-model");

const validateRecipeById = (req, res, next) => {
  const { id } = req.params;

  Recipes.findRecipeById(id).then((recipe) => {
    if (recipe.length > 0) next();
    else {
      res.status(404).json({ error: `recipe with id: ${id} was not found` });
    }
  });
};

module.exports = {
  validateRecipeById
};
