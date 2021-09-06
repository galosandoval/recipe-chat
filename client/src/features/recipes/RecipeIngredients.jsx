import React from "react";

export const RecipeIngredients = ({ ingredients }) => {
  return (
    <div className="ingredients">
      {ingredients.map((ingredient) => (
        <div className="ingredient" key={ingredient.id}>
          <p>{ingredient.name}</p>
        </div>
      ))}
    </div>
  );
};
