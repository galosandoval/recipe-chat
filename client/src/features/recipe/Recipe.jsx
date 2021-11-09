import React, { useState } from "react";

import { AddRecipe } from "./AddRecipe";
import { RecipeCard } from "./RecipeCard";

const initialFormState = {
  formClassName: "recipe__add-form",
  buttonClassName: "recipe__button",
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
    if (className.includes("recipe__button")) {
      formState.isOpen
        ? setFormState(initialFormState)
        : setFormState({
            formClassName: "recipe__add-form recipe__add-form--show",
            buttonClassName: "recipe__button recipe__button--rotate",
            isOpen: true
          });
    }
  };
  return (
    <div className="recipe" onClick={handleClick}>
      <h1>Recipes</h1>
      <div className={formState.formClassName}>
        <AddRecipe recipes={recipes} getRecipes={getRecipes} />
      </div>
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
      <div className="recipe__button-container">
        <button className={formState.buttonClassName} onClick={handleClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
