import axios from "axios";
import { useMutation } from "react-query";
import { queryClient } from "./react-query-client";

const api = axios.create({
  baseURL: "http://localhost:4000/instructions",
  headers: {
    Authorization: JSON.parse(localStorage.getItem("token"))
  }
});

const key = "instructions";

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
 * DELETE
 */
const deleteInstruction = (id) => {
  return api.delete(`${id}`);
};

/**
 * HOOKS
 */
export const useCreateInstructions = (recipeId) => {
  return useMutation(createInstructions, {
    onSuccess: () => {
      queryClient.invalidateQueries([key, recipeId]);
    }
  });
};

export const useChangeInstructions = (recipeId) => {
  return useMutation(editInstructions, {
    onSuccess: () => {
      queryClient.invalidateQueries([key, recipeId]);
    }
  });
};

export const useRemoveInstruction = (recipeId) => {
  return useMutation(deleteInstruction, {
    onSuccess: () => {
      queryClient.invalidateQueries([key, recipeId]);
    }
  });
};
