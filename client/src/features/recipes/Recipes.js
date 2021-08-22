import React from "react";
import { RecipeCard } from "./RecipeCard";

export const Recipes = ({ recipes }) => {
  return (
    <div className="recipes">
      <h1>Recipes</h1>
      <div className="recipes-container">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
};
