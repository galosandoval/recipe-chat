const db = require("../../data/connection");

const findGroceryLists = () => {
  return db("grocery-lists");
};

const findGroceryListsByUserId = (userId) => {
  return db("grocery-lists").where("user-id", userId);
};

const findAllRecipesInList = () => {
  return db("grocery-lists").join(
    "recipes",
    "grocery-lists.id",
    "=",
    "recipes.grocery-list-id"
  );
};

const reduceRecipesToGroceryListNames = (recipes) => {
  let groceryListRecipes = [];
  let ingredients = [];
  let currentRecipe = recipes[0];
  console.log(recipes);

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const ingredientName = recipe["name"];
    const groceryListName = recipe["grocery-list-name"];

    if (currentRecipe["grocery-list-name"] === groceryListName) {
      ingredients.push(ingredientName);
    }

    if (
      currentRecipe["grocery-list-name"] !== groceryListName ||
      i === recipes.length - 1
    ) {
      const groceryList = {
        id: currentRecipe.id,
        "grocery-list-name": currentRecipe["grocery-list-name"],
        ingredients
      };

      currentRecipe = recipes[i];
      groceryListRecipes.push(groceryList);
      ingredients = [ingredientName];
    }
  }

  return groceryListRecipes;
};

const findRecipesWithIngredients = (userId) => {
  return db("grocery-lists")
    .select(
      "grocery-lists.id",
      "ingredients.name",
      "grocery-lists.name as grocery-list-name"
    )
    .where("grocery-lists.user-id", userId)
    .join("recipes", "grocery-lists.id", "=", "recipes.grocery-list-id")
    .join("ingredients", "ingredients.recipe-id", "=", "recipes.id")
    .then((recipes) => {
      return reduceRecipesToGroceryListNames(recipes);
    });
};

module.exports = {
  findGroceryLists,
  findGroceryListsByUserId,
  findRecipesWithIngredients,
  findAllRecipesInList
};
