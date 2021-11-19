import React from "react";
import { xSVG } from "../../utils/svgs";
import { GrocerylistCard } from "./GrocerylistCard";

export const Grocerylist = ({ grocerylist }) => {
  console.log({ grocerylist });
  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocerylist</h1>
        <button className="x-svg-btn grocerylist__btn">{xSVG}</button>
      </div>
      <div className="grocerylist__add-grocerylist">
        <form className="add-grocerylist">
          <label htmlFor="name" className="add-grocerylist__label-name">Name
            <input type="text" className="add-grocerylist__input-name" />
          </label>
          <label className="add-grocerylist__label" htmlFor="add-recipe">
            Recipe 1
            <input type="checkbox" className="add-grocerylist__input" />
          </label>
          <label className="add-grocerylist__label" htmlFor="add-recipe">
            Recipe 2 <input type="checkbox" className="add-grocerylist__input" />
          </label>
          <label className="add-grocerylist__label" htmlFor="add-recipe">
            Recipe 3
            <input type="checkbox" className="add-grocerylist__input" />
          </label>
        </form>
      </div>
      <div className="grocerylist__card-container">
        {grocerylist.map((list) => (
          <GrocerylistCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
