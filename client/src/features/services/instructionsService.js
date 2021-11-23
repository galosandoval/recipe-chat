import axios from "axios";
import { useMutation } from "react-query";
import { queryClient } from "./react-query-client";

const api = axios.create({
  baseURL: "http://localhost:4000/instructions"
});

/**
 * POST
 */
const createInstructions = (formBody) => {
  return api.post("/", formBody);
};

/**
 * PUT
 */
const editInstructions = ({ id, formBody }) => {
  return api.put(`/${id}`, formBody);
};

/**
 * HOOKS
 */
export const useCreateInstructions = (recipeId) => {
  return useMutation(createInstructions, {
    onSuccess: () => {
      queryClient.invalidateQueries(["instructions", recipeId]);
    }
  });
};

export const useChangeInstructions = (recipeId) => {
  return useMutation(editInstructions, {
    onSuccess: () => {
      queryClient.invalidateQueries(["instructions", recipeId]);
    }
  });
};
