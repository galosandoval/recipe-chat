import React from "react";
import { xSVG } from "../../styles/svgs";
import { AddRecipe } from "../recipe/create/AddRecipe.jsx";
import { useLocation } from "react-router-dom";
import { AddGroceryList } from "../grocerylist/create/AddGroceryList";

export const FormContainer = ({ formStyle, handleClick }) => {
  const location = useLocation();

  return (
    <div style={formStyle} id="form-container" className="form-container">
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
      {location.pathname.includes("recipes") && <AddRecipe />}
      {location.pathname === "/" && <AddGroceryList />}
    </div>
  );
};
