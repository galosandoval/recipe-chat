import React from "react";

export const IngredientsList = ({ ingredients }) => {
  return (
    <div>
      {ingredients.map((ingredient) => (
        <div className="ingredient" key={ingredient.id}>
          <p>{ingredient.name}</p>
        </div>
      ))}
    </div>
  );
};
