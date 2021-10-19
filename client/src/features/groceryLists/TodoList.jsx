import axios from "axios";
import React, { useEffect, useState } from "react";
import { LineItem } from "./LineItem";

export const TodoList = ({ grocerylistId }) => {
  const [incomplete, setIncomplete] = useState([]);
  const [complete, setComplete] = useState([]);

  useEffect(() => {
    const getIngredients = (id) => {
      axios
        .get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`)
        .then((ingredients) => {
          const incompleteArray = [];
          const completeArray = [];
          ingredients.data.ingredients.forEach((ingredient) => {
            if (ingredient.isComplete) {
              completeArray.push(ingredient);
            } else {
              incompleteArray.push(ingredient);
            }
          });

          setIncomplete(incompleteArray);
          setComplete(completeArray);
        })
        .catch((error) => console.log(error));
    };
    getIngredients(grocerylistId);
  }, [grocerylistId]);
  return (
    <div className="todo-list">
      <div className="not-completed">
        {incomplete.length > 0 && <h2>Incomplete</h2>}
        {incomplete.map((ingredient, index) => (
          <LineItem
            ingredient={ingredient}
            state={complete}
            setState={setComplete}
            oldSetState={setIncomplete}
            name="check"
            index={index}
            key={`${ingredient.name}-${index}`}
          />
        ))}
      </div>
      <div className="completed">
        {complete.length > 0 && <h2>Completed</h2>}
        {complete.length > 0 &&
          complete.map((ingredient, index) => (
            <LineItem
              ingredient={ingredient}
              state={incomplete}
              setState={setIncomplete}
              oldSetState={setComplete}
              name="uncheck"
              index={index}
              key={`${ingredient.name}-${index}`}
            />
          ))}
      </div>
    </div>
  );
};
