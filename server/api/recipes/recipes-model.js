const db = require("../../data/connection");

const addRecipe = (body) => {
  return db("recipes").insert(body);
};

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

const updateRecipe = (id, changes) => {
  return db("recipes").where({ id }).update(changes, [changes]);
};

module.exports = {
  addRecipe,
  findIngredientsByRecipeId,
  findRecipes,
  findRecipesByUserId,
  updateRecipe
};
//  {
//             "id": 6,
//             "recipe-name": "test",
//             "description": "name changed",
//             "user-id": 1,
//             "grocery-list-id": 1,
//             "updated_at": "2021-09-01 01:59:51"
//         }