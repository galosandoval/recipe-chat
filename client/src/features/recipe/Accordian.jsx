import React, { useLayoutEffect } from "react";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";
import { NavLink, Route, useRouteMatch } from "react-router-dom";
import { Loading } from "../Loading";
import { useGetIngredients, useGetInstructions } from "../services/recipes";

// TODO: make tabs for Recipes and Ingredients
export const Accordian = ({ accordian, index, id }) => {
  const {
    data: ingredients,
    isLoading: ingredientsIsLoading,
    isError: ingredientsIsError
  } = useGetIngredients(id);
  const {
    data: instructions,
    isLoading: instructionsIsLoading,
    isError: instructionsIsError
  } = useGetInstructions(id);
  const match = useRouteMatch();

  // useLayoutEffect(() => {
  //   const openAccordian = document.querySelectorAll(".accordian--hidden");
  //   console.log("openaccordian:", openAccordian);
  //   if (openAccordian && openAccordian.length > 0) {
  //     openAccordian[index].style.maxHeight = `${openAccordian[index].scrollHeight}px`;
  //   }
  // });

  if (ingredientsIsLoading || instructionsIsLoading) {
    return <Loading />;
  }
  return (
    <div className={accordian.ingredientsClass}>
      <div className="accordian__tabs">
        <NavLink
          className="navbar__link accordian__link"
          activeClassName="navbar__active"
          to={`${match.url}/ingredients`}
        >
          Ingredients
        </NavLink>
        <NavLink
          className="navbar__link accordian__link"
          activeClassName="navbar__active"
          to={`${match.url}/instructions`}
        >
          Instructions
        </NavLink>
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
