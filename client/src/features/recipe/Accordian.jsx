import React, { useLayoutEffect } from "react";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";
import { NavLink, Route, useRouteMatch } from "react-router-dom";

// TODO: make tabs for Recipes and Ingredients
export const Accordian = ({ instructions, ingredients, accordian, index }) => {
  const match = useRouteMatch();
  useLayoutEffect(() => {
    const openAccordian = document.querySelectorAll(".accordian");
    if (openAccordian) {
      openAccordian[index].style.maxHeight = `${openAccordian[index].scrollHeight}px`;
    }
  });
  return (
    <div className={accordian.ingredientsClass}>
      <div className="accordian__tabs">
        <NavLink to={`${match.url}/ingredients`}>Ingredients</NavLink>
        <NavLink to={`${match.url}/instructions`}>Instructions</NavLink>
      </div>
      <Route path={`${match.url}/ingredients`}>
        <RecipeIngredients ingredients={ingredients} />
      </Route>
      <Route path={`${match.url}/instructions`}>
        <RecipeInstructions instructions={instructions} />
      </Route>
    </div>
  );
};
