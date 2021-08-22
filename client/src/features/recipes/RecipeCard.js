import React, { useEffect, useState } from "react";
import axios from "axios";

export const RecipeCard = ({ recipe }) => {
  const [ingredients, setIngredients] = useState([]);
  const getRecipeIngredients = (id) => {
    axios
      .get(`http://localhost:4000/recipes/${id}`)
      .then((ingredients) => {
        setIngredients(ingredients.data.recipeIngredients);
      })
      .catch((err) => console.log(err.message));
  };

  useEffect(() => {
    getRecipeIngredients(recipe.id);
  }, [recipe.id]);
  return (
    <div>
      <div className="img-container">
        <img
          src={
            recipe["img-url"] ||
            "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29va2luZyUyMHBvdHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          }
          alt={recipe["recipe-name"] || 'orange cooking pot'}
        />
      </div>
      <h2>{recipe["recipe-name"]}</h2>
      <p>{recipe.description}</p>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id}>
          <p>{ingredient.name}</p>
        </div>
      ))}
    </div>
  );
};
