import { useMutation } from "react-query";
import { queryClient } from "../utils/react-query-client";
import { api } from "./api";

/**
 * POST
 */
const addIngredients = (formBody) => {
  return api().post("/ingredients", formBody);
};

/**
 * PUT
 */
const editIngredients = ({ id, formBody }) => {
  return api().put(`/ingredients/recipe/${id}`, formBody);
};

/**
 * PATCH
 */
const uncheckIngredientsByGrocerylist = (id) => {
  return api().patch(`/ingredients/reset/${id}`);
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

export const useResetChecks = (id) => {
  return useMutation(() => uncheckIngredientsByGrocerylist(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["grocerylist", id, "ingredients"]);
    }
  });
};
