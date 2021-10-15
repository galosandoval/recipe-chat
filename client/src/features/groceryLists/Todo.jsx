import axios from "axios";
import React, { useEffect, useState } from "react";
import "../../styles/grocerylistStyles.css";
import { LineItem } from "./LineItem";
export const Todo = ({ listState, handleClick, grocerylistId }) => {
  const [ingredients, setIngredients] = useState(null);
  useEffect(() => {
    const getIngredients = (id) => {
      axios
        .get(`http://localhost:4000/recipes-grocery-lists/ingredients/${id}`)
        .then((ingredients) => {
          setIngredients(ingredients.data.ingredients);
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
            <div className="map-container">
              {ingredients &&
                ingredients.map((ingredient, index) => (
                  <LineItem ingredient={ingredient} key={`${ingredient}-${index}`} />
                ))}
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
