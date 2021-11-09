import React, { useState } from "react";
import { TodoList } from "./TodoList";

const initialPaperState = {
  class: "paper__container",
  isExpanded: false
};

export const Paper = ({ listState, handleClick, grocerylistId }) => {
  const [paperState, setPaperState] = useState(initialPaperState);

  const handleFullscreen = (event) => {
    const { name } = event.target;
    if (name === "expand") {
      console.log("hello");
      // card.current.requestFullscreen();
      setPaperState({
        class: "paper__container paper__container--fullscreen",
        isExpanded: true
      });
    }
    if (name === "contain") {
      // document.exitFullscreen();
      setPaperState(initialPaperState);
    }
  };
  return (
    <div className="paper" style={{ top: `${listState.setTop + 40}px` }}>
      <div className={paperState.class}>
        {paperState.isExpanded ? (
          <button className="paper__contain" name="contain" onClick={handleFullscreen}>
            contain
          </button>
        ) : (
          <>
            <button className="paper__close-btn" name="close-list" onClick={handleClick}>
              Close
            </button>
            <button name="expand" onClick={handleFullscreen}>
              expand
            </button>
          </>
        )}
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
