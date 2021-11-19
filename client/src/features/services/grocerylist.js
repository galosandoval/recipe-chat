import axios from "axios";

/**
 * GET
 */

/**
 * POST
 */
export const addNewGrocerylist = (grocerylistToAdd, recipes, checked, getGroceryLists, setForm) => {
  // TODO: Change user id
  let newGrocerylistId;
  const grocerylistBody = {
    name: grocerylistToAdd,
    "user-id": recipes[0]["user-id"]
  };

  axios
    .post("http://localhost:4000/grocery-lists/", grocerylistBody)
    .then((grocerylistAdded) => {
      newGrocerylistId = grocerylistAdded.data.groceryListId[0];
    })
    .catch((err) => console.log(err))
    .then(() => {
      const recipeBody = recipes
        .filter((_r, i) => checked[i])
        .map((r) => ({
          "recipe-id": r.id,
          "grocery-list-id": newGrocerylistId,  
          // TODO: change user id
          "user-id": recipes[0]["user-id"]
        }));
      console.log({ recipeBody });

      axios
        .post("http://localhost:4000/recipes-grocery-lists", recipeBody)
        .then((recipesAdded) => {
          console.log(recipesAdded);
          setForm((state) => ({ ...state, addButtonClass: "add-btn-svg" }));
          getGroceryLists();
        })
        .catch((err) => console.log(err));
    });
};
