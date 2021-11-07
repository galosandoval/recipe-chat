import { configureStore } from "@reduxjs/toolkit";
import groceryListReducer from "../features/Grocerylist/groceryListSlice";

export default configureStore({
  reducer: { grocerylist: groceryListReducer }
});
