import { configureStore } from "@reduxjs/toolkit";
import groceryListReducer from "../features/grocerylist/groceryListSlice";

export default configureStore({
  reducer: { grocerylist: groceryListReducer }
});
