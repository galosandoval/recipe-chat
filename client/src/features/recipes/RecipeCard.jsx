import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/recipesStyles.css";
import { Accordian } from "./Accordian";
import { useHistory } from "react-router-dom";

const initialAccordianState = {
  ingredientsClass: "accordian hidden",
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

export const RecipeCard = ({ recipe, index }) => {
  const [recipeDescription, setRecipeDescription] = useState(initialDescription(recipe));
  const [accordian, setAccordian] = useState(initialAccordianState);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);

  const history = useHistory();

  const closeOpenCarrots = () => {
    const carrots = document.querySelectorAll(".carrot");

    carrots.forEach((carrot) => {
      if (typeof carrot.className === "string" && carrot.className.includes("rotate")) {
        carrot.click();
      }
    });
  };

  const handleClick = (event) => {
    event.preventDefault();

    if (
      event.target.className.baseVal?.includes("carrot") ||
      event.target.className?.includes("carrot")
    ) {
      closeOpenCarrots();

      if (accordian.isOpen) {
        setAccordian(initialAccordianState);
      } else {
        history.push(`/recipes/ingredients/${recipe.id}`);
        setAccordian({
          ingredientsClass: "accordian",
          carrotClass: "carrot rotate",
          isOpen: true
        });
      }
    } else if (event.target.className.baseVal?.includes("button")) {
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
    const getRecipeIngredients = (id) => {
      axios
        .get(`http://localhost:4000/recipes/${id}`)
        .then((ingredients) => {
          setIngredients(ingredients.data.recipeIngredients);
        })
        .catch((err) => console.log(err.message));
    };

    const getRecipeInstructions = (id) => {
      axios
        .get(`http://localhost:4000/instructions/${id}`)
        .then((instructions) => {
          setInstructions(instructions.data.recipeInstructions);
        })
        .catch((err) => console.log({ err }));
    };
    getRecipeInstructions(recipe.id);
    getRecipeIngredients(recipe.id);
  }, [recipe.id]);

  return (
    <div className="card">
      <h2 className="recipe-name">{recipe["recipe-name"]}</h2>

      <div className="img-container">
        <img
          src={
            recipe["img-url"] ||
            "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29va2luZyUyMHBvdHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          }
          alt={recipe["recipe-name"] || "orange pot"}
        />
      </div>

      <div className="description">
        <p>{recipeDescription.description}</p>
        <button
          className={`button ${recipeDescription.showButton ? "" : "hidden"}`}
          onClick={handleClick}
        >
          {recipeDescription.buttonText}
        </button>
        <button className={`${accordian.carrotClass} carrot-button`} onClick={handleClick}>
          <svg
            className="carrot"
            onClick={handleClick}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="grey"
          >
            <path
              className="carrot"
              d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"
            />
          </svg>
        </button>
      </div>

      <Accordian
        accordian={accordian}
        instructions={instructions}
        ingredients={ingredients}
        id={recipe.id}
        index={index}
      />
    </div>
  );
};
