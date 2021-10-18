import React from "react";
import "../../styles/grocerylistStyles.css";
import { TodoList } from "./TodoList";
export const Todo = ({ listState, handleClick, grocerylistId }) => {
  return (
    <div className="todo" style={{ top: `${listState.setTop}px` }}>
      <div className="paper">
        <div className="pattern">
          <div className="content">
            <h1>Todos</h1>
            <div className="todo-list-container">
              <TodoList grocerylistId={grocerylistId} />
            </div>
            <button name="list" onClick={handleClick}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
