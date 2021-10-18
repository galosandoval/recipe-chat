const db = require("../../data/connection");
const { findIngredientsByRecipeId } = require("../recipes/recipes-model");

const findRecipesAndGroceryLists = () => db("recipes-grocery-lists");

const findRecipesAndGroceryListsByUserId = (id) => {
  return db("recipes-grocery-lists")
    .join("recipes", "recipes.id", "=", "recipes-grocery-lists.recipe-id")
    .join("grocery-lists", "grocery-lists.id", "=", "recipes-grocery-lists.grocery-list-id")
    .where("recipes.user-id", id);
};

const findRecipesByGroceryListId = async (id) => {
  const recipeGroceryLists = await db("recipes-grocery-lists")
    .join("recipes", "recipes.id", "=", "recipes-grocery-lists.recipe-id")
    .join("grocery-lists", "grocery-lists.id", "=", "recipes-grocery-lists.grocery-list-id")
    .where("recipes-grocery-lists.grocery-list-id", id)
    .select(
      "recipes-grocery-lists.id as recipes-grocery-lists-id",
      "recipes.id as recipe-id",
      "grocery-lists.id as grocery-list-id",
      "recipes.user-id",
      "recipes.recipe-name",
      "grocery-lists.name as grocery-list-name",
      "recipes.description",
      "recipes.img-url",
      "grocery-lists.completed",
      "recipes-grocery-lists.created_at",
      "recipes-grocery-lists.updated_at"
    );

  const recipesGroceryListsIds = [];
  const recipeIds = [];
  const recipeNames = [];
  const descriptions = [];
  const imgUrls = [];
  for (let i = 0; i < recipeGroceryLists.length; i++) {
    recipesGroceryListsIds.push(recipeGroceryLists[i]["recipes-grocery-lists-id"]);
    recipeIds.push(recipeGroceryLists[i]["recipe-id"]);
    recipeNames.push(recipeGroceryLists[i]["recipe-name"]);
    descriptions.push(recipeGroceryLists[i]["description"]);
    if (recipeGroceryLists[i]["img-url"] !== null) imgUrls.push(recipeGroceryLists[i]["img-url"]);
  }

  return {
    "recipes-grocery-lists-id": 1,
    "recipe-id": recipeIds,
    "grocery-list-id": recipeGroceryLists[0]["grocery-list-id"],
    "user-id": recipeGroceryLists[0]["user-id"],
    "recipe-name": recipeNames,
    "grocery-list-name": recipeGroceryLists[0]["grocery-list-name"],
    "img-url": imgUrls,
    description: descriptions,
    completed: 0,
    created_at: recipeGroceryLists[0]["created_at"],
    updated_at: recipeGroceryLists[0]["updated_at"]
  };
};

const findGroceryListIdsByUserId = async (id) => {
  const ids = await db("recipes-grocery-lists").where("user-id", id).select("grocery-list-id");
  const reducedIds = ids.reduce((prev, curr) => {
    if (prev.indexOf(curr["grocery-list-id"]) === -1) {
      prev.push(curr["grocery-list-id"]);
    }
    return prev;
  }, []);

  const mappedGroceryListInfo = [];

  for (let i = 0; i < reducedIds.length; i++) {
    let result = await findRecipesByGroceryListId(reducedIds[i]);
    mappedGroceryListInfo.push(result);
  }

  return mappedGroceryListInfo;
};

const findRecipeIdsByGroceryListId = (id) => {
  return db("recipes-grocery-lists")
    .join("recipes", "recipes.id", "=", "recipes-grocery-lists.recipe-id")
    .join("grocery-lists", "grocery-lists.id", "=", "recipes-grocery-lists.grocery-list-id")
    .where("recipes-grocery-lists.grocery-list-id", id)
    .select("recipes.id");
};

const findIngredientsByGroceryListId = async (id) => {
  const recipeIds = await findRecipeIdsByGroceryListId(id);

  const combinedIngredients = [];

  for (let i = 0; i < recipeIds.length; i++) {
    const ingredientToAdd = await findIngredientsByRecipeId(recipeIds[i].id);
    for (let j = 0; j < ingredientToAdd.length; j++) {
      const objToAdd = { name: ingredientToAdd[j].name, grocerylistId: id };
      combinedIngredients.push(objToAdd);
    }
  }

  return combinedIngredients;
};

module.exports = {
  findRecipesAndGroceryLists,
  findRecipesAndGroceryListsByUserId,
  findGroceryListIdsByUserId,
  findRecipesByGroceryListId,
  findIngredientsByGroceryListId
};
