import { useMutation, useQuery } from "react-query";
import { queryClient } from "../utils/react-query-client";
import { api } from "./api";

/**
 * GET
 */

const getRecipesByUserId = async (userId) => {
  const { data } = await api().get(`/recipes/user/${userId}`);
  return data.recipes;
};

const getIngredientsByRecipeId = async (id) => {
  const { data } = await api().get(`/recipes/ingredients/${id}`);
  return data.recipeIngredients;
};

const getInstructionsByRecipeId = async (id) => {
  const { data } = await api().get(`/instructions/recipe/${id}`);
  return data.recipeInstructions;
};

/**
 * POST
 */

const addRecipe = (recipeBody) => {
  return api().post("/recipes/", recipeBody);
};

const addIngredients = (ingredientsBody) => {
  return api().post("/ingredients/", ingredientsBody);
};

const addInstructions = (instructionsBody) => {
  return api().post("/instructions/", instructionsBody);
};

/**
 * PUT
 */
const editRecipe = ({ id, formBody }) => {
  return api().put(`/recipes/${id}`, formBody);
};

/**
 * DELETE
 */
const deleteRecipe = (id) => {
  return api().delete(`recipes/${id}`);
};

/**
 * HOOKS
 */

export const useGetRecipes = (userId) => {
  return useQuery(["recipe", userId], () => getRecipesByUserId(userId), {
    enabled: !!userId
  });
};

export const useGetIngredients = (id) => {
  return useQuery(["ingredients", id], () => getIngredientsByRecipeId(id));
};

export const useGetInstructions = (id) => {
  return useQuery(["instructions", id], () => getInstructionsByRecipeId(id));
};

export const useCreateRecipe = (recipes) => {
  return useMutation(addRecipe, {
    onSuccess: (data) => {
      queryClient.setQueryData(["recipe", { "user-id": recipes[0]["user-id"] }], data);
    }
  });
};

export const useCreateIngredients = () => {
  return useMutation(addIngredients);
};

export const useCreateInstructions = () => {
  return useMutation(addInstructions, {
    onSuccess: () => {
      queryClient.invalidateQueries("recipe");
    }
  });
};

export const useChangeRecipe = () => {
  return useMutation(editRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries("recipe");
    }
  });
};

export const useDeleteRecipe = (recipeId) => {
  return useMutation(deleteRecipe, {
    onSuccess: () => {
      queryClient.invalidateQueries(["recipe", recipeId]);
    }
  });
};
