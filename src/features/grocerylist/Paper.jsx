import React from "react";
import { xSVG } from "../../styles/svgs";
import { TodoList } from "./TodoList";

const Paper = ({ listState, handleClick, grocerylistId }) => {
  return (
    <div className="paper" id={`paper-${grocerylistId}`} style={{ top: `${listState.setTop}%` }}>
      <div className="paper__container">
        <button className="paper__btn" name="close-list" onClick={handleClick}>
          {xSVG}
        </button>
        <div className="paper__pattern">
          <div className="paper__content">
            <div className="paper__todo-list">
              <TodoList grocerylistId={grocerylistId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paper;
