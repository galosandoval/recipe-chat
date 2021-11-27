import axios from "axios";
import { useMutation } from "react-query";
import { queryClient } from "./react-query-client";

const api = axios.create({
  baseURL: "http://localhost:4000/ingredients",
  headers: {
    Authorization: JSON.parse(localStorage.getItem("token"))
  }
});

/**
 * POST
 */
const addIngredients = (formBody) => {
  return api.post("/", formBody);
};

/**
 * PUT
 */
const editIngredients = ({ id, formBody }) => {
  return api.put(`/recipe/${id}`, formBody);
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
