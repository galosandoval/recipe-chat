import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const groceryListSlice = createSlice({
  name: "grocerylist",
  initialState: {
    ingredients: []
  },
  reducers: {
    increment: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    displayGroceryList: (state, action) => {
      state.ingredients = action.payload;
    }
  }
});
// Action creators are generated for each case reducer function
export const { increment, decrement, displayGroceryList } = groceryListSlice.actions;

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const getIngredients = (id) => async (dispatch) => {
  console.log("hello");
  try {
    const res = await axios.get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`);
    const incompleteIngredients = res.data.ingredients.map((ingredient) => ({
      name: ingredient.name,
      grocerylistId: ingredient.grocerylistId,
      isComplete: false
    }));

    dispatch(displayGroceryList(incompleteIngredients));
  } catch (err) {
    console.log(err);
  }
};

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = (state) => state.counter.value;

export default groceryListSlice.reducer;
