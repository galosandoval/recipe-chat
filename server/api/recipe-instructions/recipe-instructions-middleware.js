const Instructions = require("./recipe-instructions-model");

const validateInstructionId = (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  Instructions.findInstructionById(id).then((instruction) => {
    if (instruction.length > 0) next();
    else {
      res.status(404).json({ message: `Instruction with id: ${id} not found` });
    }
  });
};

module.exports = {
  validateInstructionId
};
