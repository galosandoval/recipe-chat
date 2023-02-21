import React, { useRef, useState } from "react";
import { checkSVG } from "../../../styles/svgs";
import { useUpdateChecked } from "../../services/grocerylistService";

export const Todo = ({ ingredient, name, grocerylistId, todoClass, index, dataLength, checkedLength, uncheckedLength }) => {
  const updateChecked = useUpdateChecked(grocerylistId);
  const [isChecked, setIsChecked] = useState(() => ingredient.isChecked);
  const todo = useRef(null);

  const handleChange = () => {
    if (isChecked) todo.current.style.translateX = 0; // needs to be dynamic
    setIsChecked((state) => !state);
    updateChecked.mutate({ id: ingredient.id, isChecked: ingredient.isChecked });
  };

  return (
    <div className="todo" ref={todo} id={`todo-${grocerylistId}-${index}`}>
      <input
        className="todo__input"
        id={`${ingredient.id}-${grocerylistId}`}
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={handleChange}
      />
      <span className="todo__checkbox">
        <span className="todo__check">{checkSVG}</span>
      </span>
      <label htmlFor={`${ingredient.id}-${grocerylistId}`} className={todoClass}>
        {ingredient.name}
      </label>
    </div>
  );
};
