const db = require("../../data/connection");

const findIngredientsListById = (id) => {
  return db("ingredient-list")
    .join(
      "ingredient",
      "ingredient-list.id",
      "=",
      "ingredient.ingredient-list-id"
    )
    .select(
      "ingredient.id",
      "ingredient-list.user-id",
      "ingredient.name",
      "ingredient.price",
      "ingredient.amount",
      "ingredient.measurement"
    )
    .where("ingredient-list.id", id);
};

module.exports = {
  findIngredientsListById
};
