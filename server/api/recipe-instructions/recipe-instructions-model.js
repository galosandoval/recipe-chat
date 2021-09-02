const db = require("../../data/connection");

const findInstructions = () => db("recipe-instructions");

const findInstructionsByRecipeId = (recipeId) =>
  db("recipe-instructions").where("recipe-id", recipeId).orderBy("step");

const addInstructions = (body) => {
  return db("recipe-instructions").insert(body);
};

const deleteInstructionsByRecipeid = (id) => {
  let instructionsToBeDeleted
  findInstructionsByRecipeId(id).then(instructions => {
    instructionsToBeDeleted = instructions
  })

  return db('recipe-instructions').where('recipe-id', id).del().then(() => instructionsToBeDeleted)
}

module.exports = {
  findInstructions,
  findInstructionsByRecipeId,
  addInstructions,
  deleteInstructionsByRecipeid
};
