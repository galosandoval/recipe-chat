import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { queryClient } from "./react-query-client";

/**
 * GET
 */
const getGrocerylistsByUserId = async (userId) => {
  const { data } = await axios.get(`http://localhost:4000/recipes-grocery-lists/gl/user/${userId}`);
  return data.groceryLists;
};

const getIngredientsByGrocerylistId = async (grocerylistId) => {
  const { data } = await axios.get(
    `http://localhost:4000/recipes-grocery-lists/ingredients/${grocerylistId}`
  );
  return data.ingredients;
};

/**
 * POST
 */
const addGrocerylist = (reqBody) => {
  return axios.post("http://localhost:4000/grocery-lists/", reqBody);
};

const addRecipesToGrocerylist = (recipes) => {
  return axios.post("http://localhost:4000/recipes-grocery-lists", recipes);
};

/**
 * HOOKS
 */
export const useGrocerylist = (userId) => {
  return useQuery(["grocerylist", userId], () => getGrocerylistsByUserId(userId));
};

export const useGetIngredients = (grocerylistId) => {
  return useQuery(
    ["grocerylist", grocerylistId, "ingredients"],
    () => getIngredientsByGrocerylistId(grocerylistId),
    {// No need to make request if localstorage has data
      enabled: !!!JSON.parse(localStorage.getItem(`gl-${grocerylistId}`))
    }
  );
};

export const useCreateGrocerylist = (recipes) => {
  return useMutation(addGrocerylist, {
    onSuccess: (data) => {
      queryClient.setQueryData(["grocerylist", { "user-id": recipes[0]["user-id"] }], data);
    }
  });
};

export const useCreateRecipes = () => {
  return useMutation(addRecipesToGrocerylist, {
    onSuccess: () => {
      queryClient.invalidateQueries("grocerylist");
    }
  });
};
