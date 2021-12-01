const db = require("../../data/connection");

const recipes = "recipes";

const addRecipe = (body) => {
  return db(recipes).insert(body);
};

const findRecipes = () => db(recipes);

const findRecipeById = (id) => {
  return db(recipes).where({ id });
};

const deleteRecipe = (id) => {
  let deletedRecipe;
  findRecipeById(id).then((recipeToDelete) => {
    deletedRecipe = recipeToDelete;
  });
  return db(recipes)
    .where({ id })
    .del()
    .then(() => {
      return deletedRecipe;
    });
};

const findIngredientsByRecipeId = (id) => {
  return db(recipes)
    .join("ingredients", "recipes.id", "=", "ingredients.recipe-id")
    .select(
      "ingredients.name",
      "ingredients.id",
      "recipes.id as recipe-id",
      "ingredients.isChecked"
    )
    .where("recipes.id", id);
};

const findRecipesByUserId = (userId) => {
  return db(recipes)
    .join("users", "users.id", "=", "recipes.user-id")
    .where("user-id", userId)
    .select(
      "recipes.id",
      "recipes.recipe-name",
      "recipes.description",
      "recipes.img-url",
      "recipes.user-id",
      "recipes.address",
      "recipes.author"
    );
};

const updateRecipe = (id, changes) => {
  return db(recipes)
    .where({ id })
    .update(changes)
    .then(() => {
      return findRecipeById(id);
    });
};

module.exports = {
  addRecipe,
  deleteRecipe,
  findIngredientsByRecipeId,
  findRecipes,
  findRecipeById,
  findRecipesByUserId,
  updateRecipe
};
