import React from "react";

export const RecipeIngredients = ({ ingredients }) => {
  return (
    <div className="recipe-ingredients">
      {ingredients.map((ingredient) => (
        <div className="recipe-ingredients__item" key={ingredient.id}>
          <p className="recipe-ingredeitns__paragraph">{ingredient.name}</p>
        </div>
      ))}
    </div>
  );
};
