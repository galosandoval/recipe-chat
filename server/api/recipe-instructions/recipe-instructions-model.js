const db = require("../../data/connection");

const findInstructions = () => db("recipe-instructions");

const findInstructionsByRecipeId = (recipeId) =>
  db("recipe-instructions").where("recipe-id", recipeId).orderBy("step");

module.exports = {
  findInstructions,
  findInstructionsByRecipeId
};
