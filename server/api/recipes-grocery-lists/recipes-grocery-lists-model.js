const db = require("../../data/connection");

const findRecipesAndGroceryLists = () => db("recipes-grocery-lists");

module.exports = {
  findRecipesAndGroceryLists
}