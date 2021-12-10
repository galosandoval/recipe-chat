import React, { useState } from "react";
import { xSVG } from "../../styles/svgs";
import { NewAddRecipe } from "../recipe/create/NewAddRecipe.jsx";
import { useLocation } from "react-router-dom";
import { AddGroceryListNew } from "../grocerylist/AddGroceryListNew";

export const FormContainer = ({ formStyle, handleClick }) => {
  const location = useLocation();
  console.log(location.pathname === "/");



  return (
    <div
      style={formStyle}
      className="form-container"
     
    >
      <button className="form-container__btn-close x-svg-btn" onClick={handleClick}>
        {xSVG}
      </button>

      {location.pathname === "/" ? (
        <>
          <h1 className="form-container__title">Add a grocerylist</h1>
          <p className="form-container__desc">Input your new grocerylist info here</p>
        </>
      ) : (
        <>
          <h1 className="form-container__title">Add a recipe</h1>
          <p className="form-container__desc">Copy and paste your new recipe info here</p>
        </>
      )}
      {location.pathname.includes("recipes") && <NewAddRecipe />}
      {location.pathname === "/" && <AddGroceryListNew />}
    </div>
  );
};
