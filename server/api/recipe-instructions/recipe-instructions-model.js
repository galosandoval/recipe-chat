const db = require("../../data/connection");

const recipeInstructions = "recipe-instructions";

const findInstructions = () => db(recipeInstructions);

const findInstructionsByRecipeId = (recipeId) =>
  db(recipeInstructions).where("recipe-id", recipeId).orderBy("step");

const findInstructionById = (id) => db(recipeInstructions).where({ id });

const addInstructions = (body) => {
  return db(recipeInstructions).insert(body);
};

const deleteInstructionsByRecipeid = (id) => {
  let instructionsToBeDeleted;
  findInstructionsByRecipeId(id).then((instructions) => {
    instructionsToBeDeleted = instructions;
  });

  return db(recipeInstructions)
    .where("recipe-id", id)
    .del()
    .then(() => instructionsToBeDeleted);
};

const updateInstructions = (id, changes) => {
  changes.forEach((change) => {
    db(recipeInstructions)
      .where("id", change.id)
      .update(change)
      .then((updated) => {
        console.log(updated);
      })
      .catch((error) => console.log(error.message));
  });
  return findInstructionsByRecipeId(id);
};

const deleteInstructionById = (id) => {
  let instructionToDelete;
  findInstructionById(id).then((instruction) => (instructionToDelete = instruction));
  return db(recipeInstructions)
    .where({ id })
    .del()
    .then(() => instructionToDelete);
};

module.exports = {
  findInstructions,
  findInstructionById,
  findInstructionsByRecipeId,
  addInstructions,
  deleteInstructionsByRecipeid,
  updateInstructions,
  deleteInstructionById
};
