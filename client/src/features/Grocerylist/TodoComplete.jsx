import React from "react";

export const TodoComplete = ({ grocerylistId }) => {
  const handleResetTodos = () => {
    const todoListToReset = JSON.parse(localStorage.getItem(`gl-${grocerylistId}`));

    todoListToReset.forEach((todo) => (todo.isComplete = 0));

    localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(todoListToReset));
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
