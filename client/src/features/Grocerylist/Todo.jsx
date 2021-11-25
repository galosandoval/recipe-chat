import React from "react";
import { checkSVG } from "../../utils/svgs";
import { useUpdateChecked } from "../services/grocerylist";

export const Todo = ({ ingredient, name, grocerylistId, todoClass }) => {
  const updateChecked = useUpdateChecked(grocerylistId);

  const handleChange = (event) => {
    const { name } = event.target;

    if (name === "check") {
      updateChecked.mutate({ id: ingredient.id, isChecked: 0 });
    }

    if (name === "uncheck") {
      // ingredient.isComplete = 0;
      // const newList = [...todoList];
      // localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(newList));
      // setTodoList(newList);
    }
  };
  return (
    <div className="todo">
      <input
        className="todo__input"
        id={`${ingredient.name}-${grocerylistId}`}
        type="checkbox"
        name={name}
        checked={ingredient.isComplete}
        onChange={handleChange}
      />
      <label htmlFor={`${ingredient.name}-${grocerylistId}`} className={todoClass}>
        <span className="todo__checkbox">
          <span className="todo__check">{checkSVG}</span>
        </span>
        {ingredient.name}
      </label>
    </div>
  );
};
