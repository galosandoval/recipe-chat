import React, { useEffect, useState } from "react";
import axios from "axios";
import { StyledCard } from "../styles/cardStyle";

const initialAccordianState = {
  ingredientsClass: "hidden ingredients",
  carrotClass: "carrot",
  isOpen: false,
  style: { maxHeight: 0 }
};

const initialDescription = (recipe) => {
  return {
    description:
      recipe.description.length > 65 ? recipe.description.slice(0, 60) + "..." : recipe.description,
    isOpen: false,
    buttonText: "Read more",
    showButton: recipe.description.length > 65
  };
};

export const RecipeCard = ({ recipe }) => {
  const [recipeDescription, setRecipeDescription] = useState(initialDescription(recipe));
  const [accordian, setAccordian] = useState(initialAccordianState);
  const [ingredients, setIngredients] = useState([]);

  const getRecipeIngredients = (id) => {
    axios
      .get(`http://localhost:4000/recipes/${id}`)
      .then((ingredients) => {
        setIngredients(ingredients.data.recipeIngredients);
      })
      .catch((err) => console.log(err.message));
  };

  const handleClick = (event) => {
    event.preventDefault();

    if (event.target.className.includes("carrot")) {
      const ingredientsScrollHeight = event.target.previousElementSibling.scrollHeight;

      if (accordian.isOpen) {
        setAccordian(initialAccordianState);
      } else {
        setAccordian({
          ingredientsClass: "ingredients",
          carrotClass: "carrot rotate",
          isOpen: true,
          style: {
            maxHeight: `${ingredientsScrollHeight}px`
          }
        });
      }
    } else if (event.target.className.includes("button")) {
      if (recipeDescription.isOpen) {
        setRecipeDescription(initialDescription(recipe));
      } else {
        setRecipeDescription({
          ...recipeDescription,
          description: recipe.description,
          isOpen: true,
          buttonText: "Say less"
        });
      }
    }
  };

  useEffect(() => {
    getRecipeIngredients(recipe.id);
  }, [recipe.id]);
  return (
    <StyledCard>
      <div className="img-container">
        <img
          src={
            recipe["img-url"] ||
            "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29va2luZyUyMHBvdHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          }
          alt={recipe["recipe-name"] || "orange pot"}
        />
      </div>
      <h2>{recipe["recipe-name"]}</h2>
      <div className="description">
        <p>{recipeDescription.description}</p>
        <button
          className={`button ${recipeDescription.showButton ? "" : "hidden"}`}
          onClick={handleClick}
        >
          {recipeDescription.buttonText}
        </button>
      </div>

      <div className={accordian.ingredientsClass} style={accordian.style}>
        {ingredients.map((ingredient) => (
          <div className="ingredient" key={ingredient.id}>
            <p>{ingredient.name}</p>
          </div>
        ))}
      </div>
      <p onClick={handleClick} className={accordian.carrotClass}>
        {">"}
      </p>
    </StyledCard>
  );
};
