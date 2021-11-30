import { useMutation } from "react-query";
import { queryClient } from "../utils/react-query-client";
import { api } from "./api";

/**
 * POST
 */
const addIngredients = (formBody) => {
  return api().post("/", formBody);
};

/**
 * PUT
 */
const editIngredients = ({ id, formBody }) => {
  return api().put(`/recipe/${id}`, formBody);
};

/**
 * HOOKS
 */

export const useCreateIngredients = (recipeId) => {
  return useMutation(addIngredients, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients", recipeId]);
    }
  });
};

export const useChangeIngredients = (recipeId) => {
  return useMutation(editIngredients, {
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients", recipeId]);
    }
  });
};
