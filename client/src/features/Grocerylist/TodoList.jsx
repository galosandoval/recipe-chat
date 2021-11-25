import React, { useRef } from "react";
import { useGetIngredients } from "../services/grocerylist";
import { Loading } from "../status/Loading";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId }) => {
  const { data: ingredients, isLoading } = useGetIngredients(grocerylistId);

  const todoRef = useRef(null)
  if (isLoading) return <Loading />;

  const todoList = document.querySelector(`#todo-list-${grocerylistId}`);
  console.log({ todoList });

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
      checkedArray.push(todo);
    }
    return checkedArray;
  }, []);

  const unChecked = ingredients.reduce((uncheckedArray, ingredient) => {
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
      uncheckedArray.push(todo);
    }
    return uncheckedArray;
  }, []);

  return (
    <div className="todo-list" id={`todo-list-${grocerylistId}`} ref={todoRef}>
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
