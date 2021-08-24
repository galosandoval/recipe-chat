import React from "react";
import { Link, Route, Switch } from "react-router-dom";
import { IngredientsList } from "./IngredientsList";
import { RecipeInstructions } from "./RecipeInstructions";

export const Accordian = ({ instructions, ingredients, id }) => {
  return (
    <div>
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
    </div>
  );
};
