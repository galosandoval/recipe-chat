import React, { useState } from "react";
import { xSVG } from "../../utils/svgs";
import { Error } from "../Error";
import { Loading } from "../Loading";
import { useGetRecipes } from "../services/recipes";

import { AddRecipe } from "./AddRecipe";
import { RecipeCard } from "./RecipeCard";

const initialFormState = {
  formClassName: "add-form",
  buttonClassName: "x-svg-btn",
  isOpen: false
};

export const Recipe = () => {
  // TODO: Replace with dynamic user id
  const { data: recipes, isLoading, isError } = useGetRecipes(1);

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

  if (isError) return <Error />;
  return (
    <div className="recipe" onClick={handleClick}>
      <div className="recipe__header">
        <h1>Recipes</h1>
        <button className={formState.buttonClassName} onClick={handleClick}>
          {xSVG}
        </button>
      </div>
      <AddRecipe recipes={recipes} formStateClass={formState.formClassName} />
      <div id="recipe-container" className="recipe__card-container">
        {isLoading ? (
          <Loading />
        ) : (
          recipes.map((recipe, index) => (
            <RecipeCard
              index={index}
              key={recipe.id}
              recipe={recipe}
              closeOpenCarrots={closeOpenCarrots}
            />
          ))
        )}
      </div>
    </div>
  );
};
