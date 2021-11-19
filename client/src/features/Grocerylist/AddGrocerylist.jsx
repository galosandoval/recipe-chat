import React, { useState } from "react";
import { checkSVG } from "../../utils/svgs";
import { addNewGrocerylist } from "../services/grocerylist";
import { AddGrocerylistCheckboxes } from "./AddGrocerylistCheckboxes";

const initialGrocerylistState = "";

export const AddGrocerylist = ({ recipes, getGroceryLists, form, setForm }) => {
  const [checked, setChecked] = useState(() => new Array(recipes.length).fill(false));
  const [grocerylistToAdd, setGrocerylistToAdd] = useState(initialGrocerylistState);

  const handleSubmit = (event) => {
    event.preventDefault();

    addNewGrocerylist(grocerylistToAdd, recipes, checked, getGroceryLists, setForm);
    setGrocerylistToAdd(initialGrocerylistState);
    setChecked(checked.map((c) => (c ? !c : c)));
  };

  return (
    <form className={form.formClass} onSubmit={handleSubmit}>
      <div className="add-form__container">
        <label htmlFor="name" className="add-form__label add-form__label-name">
          Name
          <input
            type="text"
            className="add-form__input"
            placeholder="Gordon Ramsay's Recipes"
            value={grocerylistToAdd}
            onChange={(event) => setGrocerylistToAdd((e) => event.target.value)}
            required
          />
        </label>
        {recipes.map((r, i) => (
          <AddGrocerylistCheckboxes
            r={r}
            index={i}
            checked={checked}
            setChecked={setChecked}
            key={r.id}
          />
        ))}
      </div>
      <button className="add-form__btn add-btn-submit" type="submit">
        {form.isAdded ? "Grocerylist Added" : "Add Grocerylist"}
        <span className={form.addButtonClass}>{checkSVG}</span>
      </button>
    </form>
  );
};
