import React, { useEffect, useState } from "react";
import { xSVG } from "../../styles/svgs";
import { api, useGrocerylist } from "../services/grocerylistService";
import { AddGrocerylist } from "./AddGrocerylist";
import { GrocerylistCard } from "./GrocerylistCard";
import { LoadingCards } from "../status/Loading.Cards";
import { useAuth } from "../utils/auth";

const initialFormState = {
  addButtonClass: "add-btn-svg--hidden",
  plusButtonClass: "x-svg-btn grocerylist__btn",
  isOpen: false,
  isAdded: false,
  formClass: "add-form"
};

export const Grocerylist = () => {
  const [form, setForm] = useState(initialFormState);
  const { user } = useAuth();
  // const [grocerylists, setGrocerylists] = useState([]);
  const { data: grocerylists, isLoading, isError, error, isSuccess } = useGrocerylist(user.id);
  console.log({ grocerylists });

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

  // console.log({ error });

  // useEffect(() => {
  //   const getGrocerylists = async (userId) => {
  //     console.log("PLEASE WORK");
  //     const response = await api().get(`/recipes-grocery-lists/gl/user/${userId}`);
  //     setGrocerylists(response.data);
  //     console.log({ response });
  //   };
  //   getGrocerylists(user.id);
  // }, [user.id]);
  if (isError) return <h1>{error}</h1>;
  return (
    <div className="grocerylist">
      <div className="grocerylist__header">
        <h1>Grocery Lists</h1>
        <button name="form-btn" className={form.plusButtonClass} onClick={handleClick}>
          {xSVG}
        </button>
      </div>
      <AddGrocerylist form={form} />
      <div className="grocerylist__card-container">
        {isLoading ? (
          <LoadingCards />
        ) : (
          isSuccess &&
          grocerylists.map((list) => <GrocerylistCard list={list} key={list["grocery-list-id"]} />)
        )}
      </div>
    </div>
  );
};
