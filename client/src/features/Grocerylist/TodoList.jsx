import axios from "axios";
import React, { useEffect, useState } from "react";
import { Todo } from "./Todo";

export const TodoList = ({ grocerylistId }) => {
  const [todoList, setTodoList] = useState(() =>
    JSON.parse(localStorage.getItem(`incomplete-${grocerylistId}`))
  );

  useEffect(() => {
    const getIngredients = (id) => {
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

          localStorage.setItem(`incomplete-${grocerylistId}`, JSON.stringify(incompleteArray));
        })
        .catch((error) => console.log(error));
    };
    getIngredients(grocerylistId);
  }, [grocerylistId]);
  return (
    <div className="todo-list">
      <div className="todo-list__incomplete">
        {todoList.length > 0 && <h2>Incomplete</h2>}
        {todoList
          .filter((incomplete) => !incomplete.isComplete)
          .map((ingredient, index) => (
            <Todo
              ingredient={ingredient}
              todoList={todoList}
              setTodoList={setTodoList}
              name="check"
              key={ingredient.id}
              index={index}
            />
          ))}
      </div>
      <div className="todo-list__incomplete">
        {todoList.length > 0 && <h2>Completed</h2>}
        {todoList
          .filter((incomplete) => incomplete.isComplete)
          .map((ingredient, index) => (
            <Todo
              ingredient={ingredient}
              todoList={todoList}
              setTodoList={setTodoList}
              name="un-check"
              key={ingredient.id}
              index={index}
            />
          ))}
      </div>
    </div>
  );
};
