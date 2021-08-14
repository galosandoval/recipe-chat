const db = require("../../data/connection");

const findGroceryLists = () => {
  db("grocery-lists").select()
};

module.exports = {
  findGroceryLists
};
