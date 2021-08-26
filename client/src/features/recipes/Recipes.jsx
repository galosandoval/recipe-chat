import React from "react";

import '../../styles/recipesStyles.css'
import { RecipeCard } from "./RecipeCard";

export const Recipes = ({ recipes }) => {
  return (
    <div className="recipes">
      <h1>Recipes</h1>
      <div className="recipes-container">
        {recipes.map((recipe, index) => (
          <RecipeCard index={index} key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};
