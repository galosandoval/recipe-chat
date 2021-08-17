const db = require("../../data/connection");
const Recipes = require("../recipes/recipes-model");
const { use } = require("../users/users-router");

const findGroceryLists = () => {
  return db("grocery-lists");
};

const findGroceryListsByUserId = (userId) => {
  return db("grocery-lists").where("user-id", userId);
};

const findAllRecipesInList = () => {
  return db("grocery-lists").join(
    "recipes",
    "grocery-lists.id",
    "=",
    "recipes.grocery-list-id"
  );
};

const reduceRecipesToGroceryListNames = (recipes) => {
  let groceryListRecipes = [];
  let currGroceryListName = recipes[0]["grocery-list-name"];
  let ingredients = [];

  for (let i = 0; i < recipes.length; i++) {
    const ingredientName = recipes[i]["name"];
    const groceryListName = recipes[i]["grocery-list-name"];

    if (currGroceryListName === groceryListName) {
      ingredients.push(ingredientName);
    }

    if (currGroceryListName !== groceryListName || i === recipes.length - 1) {
      const groceryList = {
        "grocery-list-name": groceryListName,
        ingredients
      };

      groceryListRecipes.push(groceryList);
      ingredients = [ingredientName];
      currGroceryListName = groceryListName;
    }
  }

  return groceryListRecipes;
};

const findRecipesInList = (userId) => {
  return db("grocery-lists")
    .select("ingredients.name", "grocery-lists.name as grocery-list-name")
    .where("grocery-lists.user-id", userId)
    .join("recipes", "grocery-lists.id", "=", "recipes.grocery-list-id")
    .join("ingredients", "ingredients.recipe-id", "=", "recipes.id")
    .then((recipes) => {
      return reduceRecipesToGroceryListNames(recipes);
    });
};

module.exports = {
  findGroceryLists,
  findGroceryListsByUserId,
  findRecipesInList,
  findAllRecipesInList
};
