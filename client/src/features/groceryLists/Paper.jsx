import React, { useState } from "react";
import "../../styles/grocerylistStyles.css";
import { TodoList } from "./TodoList";

const initialPaperState = {
  class: "paper",
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
        class: "paper fullscreen",
        isExpanded: true
      });
    }
    if (name === "contain") {
      // document.exitFullscreen();
      setPaperState(initialPaperState);
    }
  };
  return (
    <div className="todo" style={{ top: `${listState.setTop}px` }}>
      <div className={paperState.class}>
        {paperState.isExpanded ? (
          <button name="contain" onClick={handleFullscreen}>
            contain
          </button>
        ) : (
          <>
            <button name="list" onClick={handleClick}>
              Close
            </button>
            <button name="expand" onClick={handleFullscreen}>
              expand
            </button>
          </>
        )}
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
          </svg>
        </button>
        <div className="pattern">
          <div className="content">
            <div className="todo-list-container">
              <TodoList grocerylistId={grocerylistId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
