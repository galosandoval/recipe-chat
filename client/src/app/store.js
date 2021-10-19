import { configureStore } from "@reduxjs/toolkit";
import groceryListReducer from "../features/groceryLists/groceryListSlice";

export default configureStore({
  reducer: { grocerylist: groceryListReducer }
});
