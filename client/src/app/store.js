import { configureStore } from "@reduxjs/toolkit";
import groceryListReducer from "../features/GroceryList/groceryListSlice";

export default configureStore({
  reducer: { grocerylist: groceryListReducer }
});
