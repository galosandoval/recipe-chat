import React from "react";
import { useResetChecks } from "../../services/ingredientsService";

export const TodoComplete = ({ grocerylistId }) => {
  const { mutate } = useResetChecks(grocerylistId);
  const handleResetTodos = () => {
    mutate();
  };

  return (
    <div className="todo-complete">
      <h1 className="todo-complete__heading">All Done</h1>
      <button className="btn-round todo-complete__btn" onClick={handleResetTodos}>
        Refresh
      </button>
    </div>
  );
};
