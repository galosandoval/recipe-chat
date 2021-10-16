import axios from "axios";
import React, { useEffect, useState } from "react";
import "../../styles/grocerylistStyles.css";
import { TodoList } from "./TodoList";
export const Todo = ({ listState, handleClick, grocerylistId }) => {
  const [ingredients, setIngredients] = useState(null);
  useEffect(() => {
    const getIngredients = (id) => {
      axios
        .get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`)
        .then((ingredients) => {
          console.log(ingredients.data.ingredients);
          const notCompletedIngredients = ingredients.data.ingredients.map((ingredient) => ({
            name: ingredient,
            isComplete: false
          }));
          setIngredients(notCompletedIngredients);
        });
    };
    getIngredients(grocerylistId);
  }, [grocerylistId]);
  return (
    <div className="todo" style={{ top: `${listState.setTop}px` }}>
      <div className="paper">
        <div className="pattern">
          <div className="content">
            <h1>Todos</h1>
            <div className="todo-list-container">
              {ingredients && <TodoList ingredients={ingredients} setIngredients={setIngredients} />}
            </div>
            <button name="list" onClick={handleClick}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
