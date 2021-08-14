const db = require("../../data/connection");

const findRecipes = () => db("recipes");

const findIngredientsByRecipeId = (id) => {
  return db("recipes")
    .join("ingredients", "recipes.id", "=", "ingredients.recipe-id")
    .select(
      "ingredients.id",
      "recipes.user-id",
      "ingredients.name",
      "ingredients.price",
      "ingredients.amount",
      "ingredients.measurement"
    )
    .where("recipes.id", id);
};

module.exports = {
  findIngredientsByRecipeId, findRecipes
};
