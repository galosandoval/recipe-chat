import React from "react";
import { LineItem } from "./LineItem";

export const TodoList = ({ ingredients, setIngredients }) => {
  console.log("ingredients", ingredients);

  return (
    <div className="todo-list">
      <div className="not-completed">
        {ingredients
          .filter((ingredient) => !ingredient.isComplete)
          .map((filteredIngredient, index) => (
            <LineItem
              ingredient={filteredIngredient}
              setIngredients={setIngredients}
              name="check"
              index={index}
              key={`${filteredIngredient.name}-${index}`}
            />
          ))}
      </div>
      <div className="completed">
        {ingredients
          .filter((ingredient) => ingredient.isComplete)
          .map((ingredient, index) => (
            <LineItem
              ingredient={ingredient}
              setIngredients={setIngredients}
              name="uncheck"
              index={index}
              key={`${ingredient.name}-${index}`}
            />
          ))}
      </div>
    </div>
  );
};
