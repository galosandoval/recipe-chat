const db = require("../../data/connection");
const { findIngredientsByRecipeId } = require("../recipes/recipes-model");

const ingredients = "ingredients";

const findIngredients = () => {
  return db(ingredients);
};

const findIngredientById = (id) => {
  return db(ingredients).where("id", id);
};

const addNewIngredients = (newIngredients) => {
  return db(ingredients).insert(newIngredients);
};

const updateIngredient = (id, change) => {
  return db(ingredients)
    .where({ id })
    .update(change)
    .then(() => {
      return findIngredientById(id);
    });
};

const deleteIngredientById = (id) => {
  let deletedIngredient;
  findIngredientById(id).then((ingredientToDelete) => {
    deletedIngredient = ingredientToDelete;
  });
  return db(ingredients)
    .where({ id })
    .del()
    .then(() => {
      return deletedIngredient;
    });
};

const deleteIngredientsByRecipeId = (id) => {
  let deletedIngredients;
  findIngredientsByRecipeId(id).then((ingredientsToDelete) => {
    deletedIngredients = ingredientsToDelete;
  });
  return db(ingredients)
    .where("recipe-id", id)
    .del()
    .then(() => {
      return deletedIngredients;
    });
};

const updateIngredientsByRecipe = (id, changes) => {
  changes.forEach((change) => {
    console.log("change", change);
    db(ingredients)
      .where("id", change.id)
      .update(change)
      .then((updated) => console.log(updated))
      .catch((error) => console.log(error.message));
  });
  return findIngredientsByRecipeId(id);
};

const updateIsChecked = async (id, currentState) => {
  if (currentState.isChecked === 0) {
    await db(ingredients).where({ id }).update("isChecked", 1);
  } else {
    await db(ingredients).where({ id }).update("isChecked", 0);
  }
  return findIngredientById(id);
};

module.exports = {
  findIngredients,
  findIngredientById,
  addNewIngredients,
  updateIngredient,
  deleteIngredientById,
  deleteIngredientsByRecipeId,
  updateIngredientsByRecipe,
  updateIsChecked
};
