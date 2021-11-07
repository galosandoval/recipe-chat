import React from "react";
import { GrocerylistCard } from "./GrocerylistCard";

export const Grocerylist = ({ grocerylist }) => {
  return (
    <div className="grocery-lists">
      <div className="title">
        <h1>Grocerylist</h1>
      </div>
      <div className="grocery-lists-container">
        {grocerylist.map((list) => (
          <GrocerylistCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
