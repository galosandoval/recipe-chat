const db = require("../../data/connection");

const findInstructions = () => db("recipe-instructions");

const findInstructionsByRecipeId = (recipeId) =>
  db("recipe-instructions").where("recipe-id", recipeId).orderBy("step");

const findInstructionById = (id) => db("recipe-instructions").where({ id });

const addInstructions = (body) => {
  return db("recipe-instructions").insert(body);
};

const deleteInstructionsByRecipeid = (id) => {
  let instructionsToBeDeleted;
  findInstructionsByRecipeId(id).then((instructions) => {
    instructionsToBeDeleted = instructions;
  });

  return db("recipe-instructions")
    .where("recipe-id", id)
    .del()
    .then(() => instructionsToBeDeleted);
};

const updateInstructions = (id, changes) => {
  changes.forEach((change) => {
    db("recipe-instructions")
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
  return db("recipe-instructions")
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
