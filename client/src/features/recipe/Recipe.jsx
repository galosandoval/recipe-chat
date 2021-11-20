import React, { useState } from "react";
import { xSVG } from "../../utils/svgs";

import { AddRecipe } from "./AddRecipe";
import { RecipeCard } from "./RecipeCard";

const initialFormState = {
  formClassName: "add-form",
  buttonClassName: "x-svg-btn",
  isOpen: false
};

export const Recipe = ({ recipes, getRecipes }) => {
  const [formState, setFormState] = useState(initialFormState);
  const closeOpenCarrots = () => {
    const carrots = document.querySelectorAll(".recipe-card__carrot-button");

    carrots.forEach((carrot) => {
      if (typeof carrot.className === "string" && carrot.className.includes("rotate")) {
        carrot.click();
      }
    });
  };

  const handleClick = (event) => {
    const { className } = event.currentTarget;

    if (className === "recipe__card-container") {
      closeOpenCarrots();
    }
    if (className.includes("x-svg-btn")) {
      formState.isOpen
        ? setFormState(initialFormState)
        : setFormState({
            formClassName: "add-form add-form--show",
            buttonClassName: "x-svg-btn x-svg-btn--rotate",
            isOpen: true
          });
    }
  };
  return (
    <div className="recipe" onClick={handleClick}>
      <div className="recipe__header">
        <h1>Recipes</h1>
        <button className={formState.buttonClassName} onClick={handleClick}>
          {xSVG}
        </button>
      </div>
      <AddRecipe
        recipes={recipes}
        getRecipes={getRecipes}
        formStateClass={formState.formClassName}
      />
      <div id="recipe-container" className="recipe__card-container">
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
