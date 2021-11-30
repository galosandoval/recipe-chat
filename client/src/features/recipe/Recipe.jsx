import React, { useContext, useState } from "react";
import { xSVG } from "../../styles/svgs";
import { useGetRecipes } from "../services/recipeService";

import { AddRecipe } from "./create/AddRecipe.jsx";
import { RecipeCard } from "./RecipeCard";
import { LoadingCards } from "../status/Loading.Cards";
import { ErrorToast } from "../status/ErrorToast";
import { UserContext } from "../auth/context";
import { useAuth } from "../utils/auth";

const initialFormState = {
  formClassName: "add-form",
  buttonClassName: "x-svg-btn",
  isOpen: false
};

const Recipe = () => {
  // TODO: Replace with dynamic user id
  const { user } = useAuth();
  const { data: recipes, isLoading, isError } = useGetRecipes(user.id);

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
            buttonClassName: "x-svg-btn <x-svg-btn--rota></x-svg-btn--rota>te",
            isOpen: true
          });
    }
  };

  if (isError) return <ErrorToast errorMessage="Something went wrong" />;

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
          <LoadingCards />
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

export default Recipe;
