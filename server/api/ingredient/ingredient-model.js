const db = require("../../data/connection");

const findIngredients = () => {
  return db("ingredient");
};

const findIngredientById = (id) => {
  return db("ingredient").where("id", id);
};

module.exports = {
  findIngredients,
  findIngredientById
};
