import React from "react";
import { useGetIngredients } from "../services/grocerylistService";
import { Loading } from "../status/Loading";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId }) => {
  const { data: ingredients, isLoading } = useGetIngredients(grocerylistId);
  if (isLoading) return <Loading />;

  const arrangedIngredients = ingredients.reduce((checkedArray, ingredient, index) => {
    if (ingredient.isChecked) {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="uncheck"
          key={`${ingredient.id}-${grocerylistId}-${index}`}
          grocerylistId={grocerylistId}
          todoClass="todo__label todo__label--checked"
        />
      );
      checkedArray.push(todo);
    } else {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="check"
          key={`${ingredient.id}-${grocerylistId}-${index}`}
          grocerylistId={grocerylistId}
          todoClass="todo__label"
        />
      );
      checkedArray.unshift(todo);
    }
    return checkedArray;
  }, []);

  const checked = ingredients.reduce((checkedArray, ingredient, index) => {
    if (ingredient.isChecked) {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="uncheck"
          key={`${ingredient.id}-${grocerylistId}-${index}`}
          grocerylistId={grocerylistId}
          todoClass="todo__label todo__label--checked"
        />
      );
      checkedArray.push(todo);
    }
    return checkedArray;
  }, []);

  const unChecked = ingredients.reduce((uncheckedArray, ingredient, index) => {
    if (!ingredient.isChecked) {
      const todo = (
        <Todo
          ingredient={ingredient}
          name="check"
          key={`${ingredient.id}-${grocerylistId}-${index}`}
          grocerylistId={grocerylistId}
          todoClass="todo__label"
        />
      );
      uncheckedArray.push(todo);
    }
    return uncheckedArray;
  }, []);

  return (
    <div className="todo-list" id={`todo-list-${grocerylistId}`}>
      {ingredients.length === checked.length ? (
        <TodoComplete grocerylistId={grocerylistId} />
      ) : (
        <>
          {arrangedIngredients}
          <div className="todo-list__incomplete">
            <h2>Incomplete</h2>
            {unChecked}
          </div>
          {checked.length > 0 && <div className="todo-list__incomplete">{checked}</div>}
        </>
      )}
    </div>
  );
};
