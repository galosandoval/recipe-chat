import React, { useState } from "react";
import { checkSVG, xSVG } from "../../utils/svgs";
import { GrocerylistCard } from "./GrocerylistCard";

const initialRecipeToAddState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: ""
};
const initialAddButtonState = { class: "add__btn-svg--hidden", isAdded: false };

export const Grocerylist = ({ grocerylist }) => {
  const [recipeToAdd, setRecipetToAdd] = useState(initialRecipeToAddState);
  const [addButton, setAddButton] = useState(initialAddButtonState);

  console.log({ grocerylist });
  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocerylist</h1>
        <button className="x-svg-btn grocerylist__btn">{xSVG}</button>
      </div>
      <form className="add-form">
        <div className="add-form__container">
          <label htmlFor="name" className="add-form__label add-form__label-name">
            Name
            <input type="text" className="add-form__input" />
          </label>
          <label className="add-form__label add-form__label" htmlFor="add-recipe">
            Recipe 1
            <input type="checkbox" className="add-form__input" />
          </label>
          <label className="add-form__label add-form__label" htmlFor="add-recipe">
            Recipe 2 <input type="checkbox" className="add-form__input" />
          </label>
          <label className="add-form__label add-form__label" htmlFor="add-recipe">
            Recipe 3
            <input type="checkbox" className="add-form__input" />
          </label>
          <button className="add-btn-submit" type="submit">
            {addButton.isAdded ? "Grocerylist Added" : "Add Grocerylist"}
            <span className={addButton.class}>{checkSVG}</span>
          </button>
        </div>
      </form>
      <div className="grocerylist__card-container">
        {grocerylist.map((list) => (
          <GrocerylistCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
