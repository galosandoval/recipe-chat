import React from "react";

export const RecipeInstructions = ({ instructions }) => {
  return (
    <ol className="recipe-instructions">
      {instructions.map((instruction) => (
        <li className="recipe-instructions__item" key={instruction.id}>
          {instruction.description}
        </li>
      ))}
    </ol>
  );
};
