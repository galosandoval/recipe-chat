import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { StyledAccordian } from "../../styles/cardStyle";
import { IngredientsList } from "./IngredientsList";
import { RecipeInstructions } from "./RecipeInstructions";

export const Accordian = ({ instructions, ingredients, id }) => {
  // TODO: Why can't i query ingredients class after it opens // useLayoutEffect?
  const heightOfAccordian = document.querySelector(".ingredients");
  // heightOfAccordian.forEach((acc) => {
  //   console.log(acc.offsetHeight);
  // });

  console.log(heightOfAccordian);
  return (
    <StyledAccordian className="accordian">
      <Link to={`/recipes/ingredients/${id}`}>Ingredients</Link>
      <Link to={`/recipes/instructions/${id}`}>Recipe</Link>
      <Switch>
        <Route path={`/recipes/ingredients/${id}`}>
          <IngredientsList ingredients={ingredients} />
        </Route>
        <Route path={`/recipes/instructions/${id}`}>
          <RecipeInstructions instructions={instructions} />
        </Route>
      </Switch>
    </StyledAccordian>
  );
};
