import React from "react";

export const RecipeIngredients = ({ ingredients }) => {
  return (
    <ul className="recipe-ingredients">
      {ingredients.map((ingredient) => (
        <li className="recipe-ingredients__item" key={ingredient.id}>
          <p className="recipe-ingredients__paragraph">{ingredient.name}</p>
        </li>
      ))}
    </ul>
  );
};
