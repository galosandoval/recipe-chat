import axios from "axios";
import { useQuery } from "react-query";

/**
 * GET
 */

const getRecipesByUserId = async (userId) => {
  const { data } = await axios.get(`http://localhost:4000/recipes/user/${userId}`);
  return data.recipes;
};


/**
 * HOOKS
 */

export const useGetRecipes = (userId) => {
  return useQuery(["recipe", userId], () => getRecipesByUserId(userId));
};
