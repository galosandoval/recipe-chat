import React, { useState } from "react";
import { xSVG } from "../../styles/svgs";
import { useGrocerylist } from "../services/grocerylistService";
import { AddGrocerylist } from "./AddGrocerylist";
import { GrocerylistCard } from "./GrocerylistCard";
import { LoadingCards } from "../status/Loading.Cards";
import { useAuth } from "../utils/auth-config";

const initialFormState = {
  plusButtonClass: "x-svg-btn grocerylist__btn",
  isOpen: false,
  formClass: "add-form"
};

export const Grocerylist = () => {
  const [form, setForm] = useState(initialFormState);
  const { user } = useAuth();
  const { data: grocerylists, isLoading, isError, error, isSuccess } = useGrocerylist(user.id);

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

  if (isError) return <h1>{error}</h1>;
  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocery Lists</h1>
        <button name="form-btn" className={form.plusButtonClass} onClick={handleClick}>
          {xSVG}
        </button>
      </div>
      <AddGrocerylist form={form} initialFormState={initialFormState} setForm={setForm} />
      <div className="grocerylist__card-container">
        {isLoading ? (
          <LoadingCards />
        ) : (
          isSuccess &&
          grocerylists.map((list, index) => (
            <GrocerylistCard index={index} list={list} key={list["grocery-list-id"]} />
          ))
        )}
      </div>
    </div>
  );
};
