import React, { useState } from "react";
import { checkSVG } from "../../utils/svgs";

const initialGrocerylistState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: ""
};
const initialAddButtonState = { class: "add__btn-svg--hidden", isAdded: false };

export const AddGrocerylist = ({ recipes }) => {
  const [grocerylistToAdd, setGrocerylistToAdd] = useState(initialGrocerylistState);
  const [addButton, setAddButton] = useState(initialAddButtonState);

  console.log({ recipes });

  return (
    <form className="add-form">
      <div className="add-form__container">
        <label htmlFor="name" className="add-form__label add-form__label-name">
          Name
          <input type="text" className="add-form__input" placeholder="Gordon Ramsay's Recipes" />
        </label>
        {recipes.map((r) => (
          <div className="add-form__switch-container">
            <p>{r["recipe-name"]}</p>
            <label className="add-form__switch" htmlFor="add-recipe">
              <input type="checkbox" className="add-form__checkbox" />
              <span className="add-form__slider"></span>
            </label>
          </div>
        ))}
      </div>
      <button className="add-form__btn add-btn-submit" type="submit">
        {addButton.isAdded ? "Grocerylist Added" : "Add Grocerylist"}
        <span className={addButton.class}>{checkSVG}</span>
      </button>
    </form>
  );
};
