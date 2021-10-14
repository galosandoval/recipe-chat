import React from "react";
import { GroceryListCard } from "./GroceryListCard";

export const GroceryLists = ({ groceryLists }) => {
  console.log(groceryLists);
  return (
    <div className="grocery-lists">
      <div className="title">
        <h1>GroceryLists</h1>
      </div>
      <div className="grocery-lists-container">
        {groceryLists.map((list) => (
          <GroceryListCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
