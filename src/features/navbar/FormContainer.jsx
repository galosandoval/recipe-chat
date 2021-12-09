import React from "react";
import { xSVG } from "../../styles/svgs";
import { NewAddRecipe } from "../recipe/create/NewAddRecipe.jsx";

export const FormContainer = ({ formStyle, handleClick }) => {
  return (
    <div style={formStyle} className="form-container">
      <button className="form-container__btn-close x-svg-btn" onClick={handleClick}>
        {xSVG}
      </button>

      <h1 className="form-container__title">Add a recipe</h1>
      <p className="form-container__desc">Copy and paste your new recipe info here</p>
      <NewAddRecipe />
    </div>
  );
};
