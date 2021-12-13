import React, { useState } from "react";
import { xSVG } from "../../../styles/svgs";
import { useGetIngredients } from "../../services/grocerylistService";
import { Loading } from "../../status/Loading";
import { TodoList } from "./TodoList";

const Paper = ({ listState, handleClick, grocerylistId }) => {
  const { data, isLoading } = useGetIngredients(grocerylistId);

  if (isLoading) return <Loading />;

  return (
    <div className="paper" id={`paper-${grocerylistId}`} style={{ top: `${listState.setTop}%` }}>
      <div className="paper__container">
        <button className="paper__btn" name="close-list" onClick={handleClick}>
          {xSVG}
        </button>
        <div className="paper__pattern">
          <div className="paper__content">
            <div className="paper__todo-list">
              <TodoList data={data} grocerylistId={grocerylistId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paper;
