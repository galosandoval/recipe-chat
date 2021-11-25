import React, { useEffect, useState } from "react";
import { useGetIngredients } from "../services/grocerylist";
import { Loading } from "../status/Loading";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId }) => {
  const { data: ingredients, isLoading } = useGetIngredients(grocerylistId);

  if (isLoading) return <Loading />;

  const checked = ingredients.reduce((checkedArray, ingredient) => {
    if (ingredient.isChecked) {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="uncheck"
          key={ingredient.id}
          grocerylistId={grocerylistId}
          todoClass="todo__label todo__label--checked"
        />
      );
      console.log({ todo });
      checkedArray.push(todo);
    }
    return checkedArray;
  }, []);

  const unChecked = ingredients.reduce((unCheckedArray, ingredient) => {
    if (!ingredient.isChecked) {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="check"
          key={ingredient.id}
          grocerylistId={grocerylistId}
          todoClass="todo__label"
        />
      );
      unCheckedArray.push(todo);
    }
    return unCheckedArray;
  }, []);

  return (
    <div className="todo-list">
      {ingredients.length === checked.length ? (
        <TodoComplete grocerylistId={grocerylistId} />
      ) : (
        <>
          <div className="todo-list__incomplete">
            <h2>Incomplete</h2>
            {unChecked}
          </div>
          {checked.length > 0 && (
            <div className="todo-list__incomplete">
              <h2>Completed</h2>
              {checked}
            </div>
          )}
        </>
      )}
    </div>
  );
};
