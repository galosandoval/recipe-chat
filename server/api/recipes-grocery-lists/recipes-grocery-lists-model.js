const db = require("../../data/connection");
const { findIngredientsByRecipeId } = require("../recipes/recipes-model");

const findRecipesAndGroceryLists = () => db("recipes-grocery-lists");

const findRecipesByGroceryListId = (id) => {
  return db("recipes-grocery-lists")
    .join("recipes", "recipes.id", "=", "recipes-grocery-lists.recipe-id")
    .join("grocery-lists", "grocery-lists.id", "=", "recipes-grocery-lists.grocery-list-id")
    .where("recipes-grocery-lists.grocery-list-id", id);
};

const findRecipeIdsByGroceryListId = (id) => {
  return db("recipes-grocery-lists")
    .join("recipes", "recipes.id", "=", "recipes-grocery-lists.recipe-id")
    .join("grocery-lists", "grocery-lists.id", "=", "recipes-grocery-lists.grocery-list-id")
    .where("recipes-grocery-lists.grocery-list-id", id)
    .select("recipes.id");
};

const findIngredientsByGroceryListId = async (id) => {
  const recipeIds = await findRecipeIdsByGroceryListId(id);

  let combinedIngredients = [];

  for (let i = 0; i < recipeIds.length; i++) {
    const ingredientToAdd = await findIngredientsByRecipeId(recipeIds[i].id);
    for (let j = 0; j < ingredientToAdd.length; j++) {
      combinedIngredients.push(ingredientToAdd[j].name);
    }
  }

  return combinedIngredients;
};

module.exports = {
  findRecipesAndGroceryLists,
  findRecipesByGroceryListId,
  findIngredientsByGroceryListId
};
