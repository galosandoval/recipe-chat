import React, { useRef, useState } from "react";
import { checkSVG } from "../../../styles/svgs";
import { useUpdateChecked } from "../../services/grocerylistService";
import { CheckboxLabel, StyledTodo, TodoCheck, TodoCheckbox, TodoInput } from "./StyledPaper";

export const Todo = ({ ingredient, grocerylistId, position, mockData, setMockData }) => {
  const updateChecked = useUpdateChecked();
  const todo = useRef(null);

  const handleChange = async () => {
    setMockData((state) =>
      state.reduce((newArray, current) => {
        if (current.id === ingredient.id) current.isChecked = !current.isChecked;

        newArray.push(current);
        return newArray;
      }, [])
    );
    updateChecked.mutate({ id: ingredient.id, isChecked: ingredient.isChecked });
  };

  return (
    <StyledTodo ref={todo}>
      <TodoInput
        id={`${ingredient.id}-${grocerylistId}`}
        type="checkbox"
        checked={ingredient.isChecked}
        onChange={handleChange}
      />
      <TodoCheckbox>
        <TodoCheck>{checkSVG}</TodoCheck>
      </TodoCheckbox>
      <CheckboxLabel isChecked={ingredient.isChecked} htmlFor={`${ingredient.id}-${grocerylistId}`}>
        {ingredient.name}
      </CheckboxLabel>
    </StyledTodo>
  );
};
