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

// TODO finish shaping the returned json
// just added the 2nd join
const findRecipesInList = (userId) => {
  return db("grocery-lists")
    .where("grocery-lists.user-id", userId)
    .join("recipes", "grocery-lists.id", "=", "recipes.grocery-list-id")
    .join("ingredients", "ingredients.recipe-id", "=", "recipes.id");
  // .then((recipe) => {
  //   const resultMap = recipe.reduce((result, row) => {
  //     console.log("result", result);
  //     console.log("row", row);
  //     console.log("result[row.id]", { ...row, recipe: [] });

  //     result[row.id] = { ...row, ingredients: [] };
  //     result[row.id].ingredients.push({
  //       hey: "hello"
  //     });
  //     return result;
  //   }, {});
  //   return Object.values(resultMap);
  // });
};

module.exports = {
  findGroceryLists,
  findGroceryListsByUserId,
  findRecipesInList,
  findAllRecipesInList
};
