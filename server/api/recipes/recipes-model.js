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

const findRecipesByUserId = (userId) => {
  return db("recipes")
    .join("users", "users.id", "=", "recipes.user-id")
    .where("user-id", userId)
    .select(
      "recipes.id",
      "recipes.grocery-list-id",
      "recipes.recipe-name",
      "recipes.description",
      "recipes.img-url"
    );
};

module.exports = {
  findIngredientsByRecipeId,
  findRecipes,
  findRecipesByUserId
};
