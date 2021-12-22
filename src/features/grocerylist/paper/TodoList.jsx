import React, { useEffect, useState } from "react";
import { Todo } from "./Todo";
import { TodoComplete } from "./TodoComplete";

export const TodoList = ({ grocerylistId, data }) => {
  const [ingredients, setIngredients] = useState([]);
  console.log({ ingredients });

  const checked = data.filter((d) => d.isChecked);
  const unchecked = data.filter((d) => !d.isChecked);

  // const checked = data.reduce((checkedArray, ingredient, index) => {
  //   if (ingredient.isChecked) {
  //     const todo = (
  //       <Todo
  //         ingredient={ingredient}
  //         name="uncheck"
  //         key={`${ingredient.id}-${grocerylistId}-${index}`}
  //         grocerylistId={grocerylistId}
  //         todoClass="todo__label todo__label--checked"
  //       />
  //     );
  //     checkedArray.push(todo);
  //   }
  //   return checkedArray;
  // }, []);

  // const unChecked = data.reduce((uncheckedArray, ingredient, index) => {
  //   if (!ingredient.isChecked) {
  //     const todo = (
  //       <Todo
  //         ingredient={ingredient}
  //         name="check"
  //         key={`${ingredient.id}-${grocerylistId}-${index}`}
  //         grocerylistId={grocerylistId}
  //         todoClass="todo__label"
  //       />
  //     );
  //     uncheckedArray.push(todo);
  //   }
  //   return uncheckedArray;
  // }, []);

  useEffect(() => {
    if (data) {
      const arrangedIngredients = data.reduce((checkedArray, ingredient, index) => {
        const todo = (
          <Todo
            ingredient={ingredient}
            name="check"
            key={`${ingredient.id}-${grocerylistId}-${index}`}
            grocerylistId={grocerylistId}
            todoClass="todo__label"
            index={index}
            dataLength={data.length}
            checkedLength={checked.length}
            uncheckedLength={unchecked.length}
          />
        );
        if (ingredient.isChecked) {
          // Consolidate to one todo to add index
          // Find out how to move an item to the end of an array
          // Replicate that on the DOM

          checkedArray.push(todo);
        } else {
          checkedArray.unshift(todo);
        }
        return checkedArray;
      }, []);
      setIngredients(arrangedIngredients);
    }
  }, [data, grocerylistId]);

  return (
    <div className="todo-list" id={`todo-list-${grocerylistId}`}>
      {ingredients.length === checked.length ? (
        <TodoComplete grocerylistId={grocerylistId} />
      ) : (
        <>
          {ingredients}
          <div className="todo-list__incomplete">
            <h2>Incomplete</h2>
            {/* {unChecked} */}
          </div>
          {/* {checked.length > 0 && <div className="todo-list__incomplete">{checked}</div>} */}
        </>
      )}
    </div>
  );
};
