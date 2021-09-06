const User = require("../users/users-model");
const { findGroceryListById } = require("./grocery-lists-model");

const validateGroceryListId = (req, res, next) => {
  const { id } = req.params;
  
  findGroceryListById(id).then((groceryList) => {
    if (groceryList.length !== 0) next();
    else res.status(404).json({ error: `grocery list with id: ${id} not found` });
  });
};

module.exports = {
  validateGroceryListId
};
