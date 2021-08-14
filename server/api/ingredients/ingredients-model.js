const db = require("../../data/connection");

const findIngredients = () => {
  return db("ingredients");
};

const findIngredientById = (id) => {
  return db("ingredients").where("id", id);
};

module.exports = {
  findIngredients,
  findIngredientById
};
