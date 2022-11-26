import React from "react";

import { useGetRecipes } from "../services/recipeService";
import { RecipeCard } from "./RecipeCard";
import { LoadingCards } from "../status/Loading.Cards";
import { ErrorToast } from "../status/ErrorToast";
import { useAuth } from "../utils/auth-config";

const Recipe = () => {
  const { user } = useAuth();
  const { data: recipes, isLoading, isError } = useGetRecipes(user.id);

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
  };

  if (isError) return <ErrorToast errorMessage="Something went wrong" />;

  return (
    <div className="recipe" onClick={handleClick}>
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
