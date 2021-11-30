import { useMutation, useQuery } from "react-query";
import { queryClient } from "../utils/react-query-client";
import { api } from "./api";

/**
 * GET
 */
const getGrocerylistsByUserId = async (userId) => {
  const { data } = await api().get(`/recipes-grocery-lists/gl/user/${userId}`);
  return data;
};

const getIngredientsByGrocerylistId = async (grocerylistId) => {
  const { data } = await api().get(`/recipes-grocery-lists/ingredients/${grocerylistId}`);
  return data.ingredients;
};

/**
 * POST
 */
const addGrocerylist = (reqBody) => {
  return api().post("/grocery-lists/", reqBody);
};

const addRecipesToGrocerylist = (recipes) => {
  return api().post("/recipes-grocery-lists", recipes);
};

/**
 * PATCH
 */
const updateIsChecked = ({ id, isChecked }) => {
  console.log({ id, isChecked });
  return api().patch(`/ingredients/${id}`, { isChecked });
};

/**
 * HOOKS
 */
export const useGrocerylist = (userId) => {
  return useQuery(["grocerylist", userId], () => getGrocerylistsByUserId(userId), {
    enabled: !!userId
  });
};

export const useGetIngredients = (grocerylistId) => {
  return useQuery(["grocerylist", grocerylistId, "ingredients"], () =>
    getIngredientsByGrocerylistId(grocerylistId)
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

export const useUpdateChecked = (grocerylistId) => {
  return useMutation(updateIsChecked, {
    onSuccess: () => {
      queryClient.invalidateQueries(["grocerylist", grocerylistId, "ingredients"]);
    }
  });
};
