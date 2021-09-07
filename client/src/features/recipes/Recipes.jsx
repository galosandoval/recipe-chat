import React from "react";

import "../../styles/recipesStyles.css";
import { RecipeCard } from "./RecipeCard";

export const Recipes = ({ recipes }) => {
  const closeOpenCarrots = () => {
    const carrots = document.querySelectorAll(".carrot");

    carrots.forEach((carrot) => {
      if (typeof carrot.className === "string" && carrot.className.includes("rotate")) {
        carrot.click();
      }
    });
  };

  const handleClick = (event) => {
    if (event.target.className === "recipes-container") {
      closeOpenCarrots();
    }
  };
  return (
    <div className="recipes" onClick={handleClick}>
      <h1>Recipes</h1>
      <div className="recipes-container">
        {recipes.map((recipe, index) => (
          <RecipeCard
            index={index}
            key={recipe.id}
            recipe={recipe}
            closeOpenCarrots={closeOpenCarrots}
          />
        ))}
      </div>
    </div>
  );
};
