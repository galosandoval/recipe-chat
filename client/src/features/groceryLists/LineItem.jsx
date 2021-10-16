import React, { useState } from "react";

export const LineItem = ({ ingredient, setIngredients, name, index }) => {
  const [checked, setChecked] = useState(ingredient.isComplete);

  const changeState = (stateChange) => {
    setIngredients((state) => {
      let newObject = state[index];
      newObject.isComplete = stateChange;
      return [...state.slice(0, index), newObject, ...state.slice(index + 1)];
    });
  };

  const handleChange = (event) => {
    const { name } = event.target;

    if (name === "check") {
      setChecked(true);
      changeState(true);
    }
    if (name === "uncheck") {
      setChecked(false);
      changeState(false);
    }
  };
  return (
    <div className="line-item">
      <p>{ingredient.name}</p>
      <input type="checkbox" name={name} checked={checked} onChange={handleChange} />
    </div>
  );
};
