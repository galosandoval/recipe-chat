import React from "react";
import { xSVG } from "../../utils/svgs";
import { AddGrocerylist } from "./AddGrocerylist";
import { GrocerylistCard } from "./GrocerylistCard";

export const Grocerylist = ({ recipes, grocerylist }) => {
  console.log({ grocerylist });
  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocerylist</h1>
        <button className="x-svg-btn grocerylist__btn">{xSVG}</button>
      </div>
      <AddGrocerylist recipes={recipes} />
      <div className="grocerylist__card-container">
        {grocerylist.map((list) => (
          <GrocerylistCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
