import React from "react";

export const RecipeInstructions = ({ instructions }) => {
  return (
    <div>
      <ol>
        {instructions.map((instruction) => (
          <li key={instruction.id}>{instruction.description}</li>
        ))}
      </ol>
    </div>
  );
};
