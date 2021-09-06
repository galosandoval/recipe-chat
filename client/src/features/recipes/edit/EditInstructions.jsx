import React from "react";

const initialFormState = (recipe) => ({
  "recipe-name": recipe["recipe-name"],
  "img-url": recipe["img-url"] || "",
  description: recipe.description
});

export const EditInstructions = ({ instructions }) => {
  console.log(instructions);
  return <div className="edit-instructions"></div>;
};
