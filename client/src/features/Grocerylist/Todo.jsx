import React, { useState } from "react";
import { checkSVG } from "../../utils/svgs";

export const Todo = ({ ingredient, todoList, setTodoList, name, grocerylistId, todoClass }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (event) => {
    const { name } = event.target;
    if (name === "check") {
      setIsChecked(true);
      console.log("checked", isChecked);
      ingredient.isComplete = 1;
      const newList = [...todoList];

      localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(newList));
      setTodoList(newList);
    }

    if (name === "uncheck") {
      setIsChecked(false);

      ingredient.isComplete = 0;
      const newList = [...todoList];

      localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(newList));
      setTodoList(newList);
    }
  };
  return (
    <div className="todo">
      <input
        className="todo__input"
        id={ingredient.name}
        type="checkbox"
        name={name}
        checked={ingredient.isComplete}
        onChange={handleChange}
      />
      <label htmlFor={ingredient.name} className={todoClass}>
        <span className="todo__checkbox">
          <span className="todo__check">{checkSVG}</span>
        </span>
        {ingredient.name}
      </label>
    </div>
  );
};
