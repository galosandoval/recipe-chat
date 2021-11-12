import React from "react";
import { checkSVG } from "../../utils/svgs";

export const Todo = ({ ingredient, todoList, setTodoList, name, index }) => {
  console.log("ingredient", ingredient);
  const handleChange = (event) => {
    const { name } = event.target;
    if (name === "check") {
      ingredient.isComplete = 1;
      const newList = [...todoList, ingredient];
      setTodoList(newList);
      console.log("check", ingredient);

      console.log("incomplete", todoList);

      // const oldArray = JSON.parse(localStorage.getItem(``));
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
      <label htmlFor={ingredient.name} className="todo__label">
        <span className="todo__checkbox">
          <span className="todo__check">{checkSVG}</span>
        </span>
        {ingredient.name}
      </label>
    </div>
  );
};
