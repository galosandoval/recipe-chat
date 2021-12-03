import React, { useState } from "react";
import { checkSVG } from "../../styles/svgs";
import { useUpdateChecked } from "../services/grocerylistService";

export const Todo = ({ ingredient, name, grocerylistId, todoClass }) => {
  const updateChecked = useUpdateChecked(grocerylistId);
  const [isChecked, setIsChecked] = useState(() => ingredient.isChecked);

  const handleChange = () => {
    setIsChecked((state) => !state);
    updateChecked.mutate({ id: ingredient.id, isChecked: ingredient.isChecked });
  };

  return (
    <div className="todo">
      <input
        className="todo__input"
        id={`${ingredient.id}-${grocerylistId}`}
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={handleChange}
      />
      <label htmlFor={`${ingredient.id}-${grocerylistId}`} className={todoClass}>
        <span className="todo__checkbox">
          <span className="todo__check">{checkSVG}</span>
        </span>
        {ingredient.name}
      </label>
    </div>
  );
};
