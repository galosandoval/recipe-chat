import React, { useState } from "react";
import { xSVG } from "../../utils/svgs";
import { AddGrocerylist } from "./AddGrocerylist";
import { GrocerylistCard } from "./GrocerylistCard";

const initialFormState = {
  addButtonClass: "add-btn-svg--hidden",
  plusButtonClass: "x-svg-btn grocerylist__btn",
  isOpen: false,
  isAdded: false,
  formClass: "add-form"
};

export const Grocerylist = ({ recipes, grocerylist, getGroceryLists }) => {
  const [form, setForm] = useState(initialFormState);

  const handleClick = (event) => {
    const { name } = event.currentTarget;

    if (name === "form-btn") {
      form.isOpen
        ? setForm(initialFormState)
        : setForm((state) => ({
            ...state,
            formClass: "add-form add-form--show",
            plusButtonClass: "x-svg-btn x-svg-btn--rotate grocerylist__btn ",
            isOpen: true
          }));
    }
  };

  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocerylist</h1>
        <button name="form-btn" className={form.plusButtonClass} onClick={handleClick}>
          {xSVG}
        </button>
      </div>
      {recipes.length > 0 && (
        <AddGrocerylist
          form={form}
          setForm={setForm}
          getGroceryLists={getGroceryLists}
          recipes={recipes}
        />
      )}
      <div className="grocerylist__card-container">
        {grocerylist.map((list) => (
          <GrocerylistCard list={list} key={list["grocery-list-id"]} />
        ))}
      </div>
    </div>
  );
};
