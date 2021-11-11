import axios from "axios";
import React from "react";
import { checkSVG } from "../../utils/svgs";

export const Todo = ({ ingredient, state, setState, name, oldSetState }) => {
  const handleChange = () => {
    const body = {
      id: ingredient.id,
      "recipe-id": ingredient["recipe-id"],
      name: ingredient.name,
      isComplete: !ingredient.isComplete
    };

    axios
      .put(`http://localhost:4000/ingredients/${ingredient.id}`, body)
      .then((change) => {
        const newArr = [...state, change.data.updatedIngredient[0]];
        setState(newArr);
      })
      .then(() => {
        oldSetState((state) => state.filter((change) => change.id !== ingredient.id));
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className="todo">
      <input
        className="todo__input"
        id="todo"
        type="checkbox"
        name={name}
        checked={ingredient.isComplete}
        onChange={handleChange}
      />
      <label htmlFor="todo" className="todo__label">
        <span className="todo__checkbox">
          <span className="todo__check">{checkSVG}</span>
        </span>
        {ingredient.name}
      </label>
    </div>
  );
};
