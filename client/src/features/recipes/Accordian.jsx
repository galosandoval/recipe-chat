import React, { useLayoutEffect } from "react";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";

// TODO: make tabs for Recipes and Ingredients
export const Accordian = ({ instructions, ingredients, accordian, index }) => {
  useLayoutEffect(() => {
    const openAccordian = document.querySelectorAll(".accordian");
    if (openAccordian) {
      openAccordian[index].style.maxHeight = `${openAccordian[index].scrollHeight}px`;
    }
  });
  return (
    <div className={accordian.ingredientsClass}>
      <div className="links"></div>
      <RecipeIngredients ingredients={ingredients} />
      <RecipeInstructions instructions={instructions} />
    </div>
  );
};
