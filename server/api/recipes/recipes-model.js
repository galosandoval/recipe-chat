const db = require("../../data/connection");

const findRecipes = () => db("recipes");

const findIngredientsByRecipeId = (id) => {
  return db("recipes")
    .join("ingredients", "recipes.id", "=", "ingredients.recipe-id")
    .select(
      "recipes.recipe-name",
      "ingredients.name",
      "ingredients.id",
      "recipes.user-id",
      "ingredients.price",
      "ingredients.amount",
      "ingredients.measurement"
    )
    .where("recipes.id", id);
};

module.exports = {
  findIngredientsByRecipeId,
  findRecipes
};
