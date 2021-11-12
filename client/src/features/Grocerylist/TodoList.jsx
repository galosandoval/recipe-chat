import axios from "axios";
import React, { useEffect, useState } from "react";
import { Todo } from "./Todo";

export const TodoList = ({ grocerylistId }) => {
  const [todoList, setTodoList] = useState(() =>
    JSON.parse(localStorage.getItem(`gl-${grocerylistId}`))
  );
  const incomplete =
    todoList !== null &&
    todoList
      .filter((incomplete) => incomplete.isComplete)
      .map((ingredient) => (
        <Todo
          ingredient={ingredient}
          todoList={todoList}
          setTodoList={setTodoList}
          name="uncheck"
          key={ingredient.id}
          grocerylistId={grocerylistId}
          todoClass="todo__label todo__label--checked"
        />
      ));

  useEffect(() => {
    const getIngredients = (id) => {
      if (localStorage.getItem(`gl-${grocerylistId}`) === null) {
        axios
          .get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`)
          .then((ingredients) => {
            const incompleteArray = [];
            ingredients.data.ingredients.forEach((ingredient) => {
              const ingredientData = {
                name: ingredient.name,
                isComplete: 0,
                id: ingredient.id,
                recipeId: ingredient["recipe-id"]
              };
              incompleteArray.push(ingredientData);
            });
            setTodoList(incompleteArray);
            localStorage.setItem(`gl-${grocerylistId}`, JSON.stringify(incompleteArray));
          })
          .catch((error) => console.log(error));
      }
    };
    getIngredients(grocerylistId);
  }, [grocerylistId]);
  return (
    <div className="todo-list">
      <div className="todo-list__incomplete">
        {todoList !== null && <h2>Incomplete</h2>}
        {todoList !== null &&
          todoList
            .filter((incomplete) => !incomplete.isComplete)
            .map((ingredient) => (
              <Todo
                ingredient={ingredient}
                todoList={todoList}
                setTodoList={setTodoList}
                name="check"
                key={ingredient.id}
                grocerylistId={grocerylistId}
                todoClass="todo__label"
              />
            ))}
      </div>
      <div className="todo-list__incomplete">
        {incomplete.length > 0 ? (
          <>
            <h2>Completed</h2>
            {incomplete}
          </>
        ) : null}
      </div>
    </div>
  );
};
