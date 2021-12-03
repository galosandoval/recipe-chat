const db = require("../../data/connection");

const recipes = "recipes";

const addRecipe = (body) => {
  return db(recipes).insert(body);
};

const findRecipes = () => db(recipes);

const findRecipeById = (id) => {
  return db(recipes).where({ id });
};

const deleteRecipe = async (id) => {
  let recipeToDelete;
  findRecipeById(id).then((recipe) => {
    recipeToDelete = recipe;
  });
  await db("recipe-instructions").where("recipe-id", id).del();
  await db("ingredients").where("recipe-id", id).del();
  await db("recipes-grocery-lists").where("recipe-id", id).del();
  await db(recipes).where({ id }).del();
  return recipeToDelete;
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
    .whereIn("user-id", [userId === 1 ? 1 : 1, userId])
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
