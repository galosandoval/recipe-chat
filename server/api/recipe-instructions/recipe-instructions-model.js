const db = require("../../data/connection");

const findAllInstructions = () => db("recipe-instructions");

const findInstructionsByRecipeId = (recipeId) =>
  db("recipe-instructions").where("recipe-id", recipeId).orderBy("step");

module.exports = {
  findAllInstructions,
  findInstructionsByRecipeId
};
