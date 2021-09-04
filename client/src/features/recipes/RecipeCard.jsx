import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/recipesStyles.css";
import { Accordian } from "./Accordian";
import { CardMenu } from "./CardMenu";

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

const initialDropdownState = {
  class: "dropdown-content",
  open: false
};

export const RecipeCard = ({ recipe, index, closeOpenCarrots }) => {
  const [recipeDescription, setRecipeDescription] = useState(initialDescription(recipe));
  const [accordian, setAccordian] = useState(initialAccordianState);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [dropdown, setDropdown] = useState(initialDropdownState);

  // Handle carrot click and 'Read more'
  const handleClick = (event) => {
    console.log(event.currentTarget)
    if (event.currentTarget.className === "dropdown") {
      !dropdown.open
      ? setDropdown({ class: "dropdown-content show", open: true })
      : setDropdown(initialDropdownState);
      // Carrot click
    } else if (event.currentTarget.className.includes("carrot")) {
      closeOpenCarrots();

      if (accordian.isOpen) {
        setAccordian(initialAccordianState);
      } else if (!accordian.isOpen) {
        setAccordian({
          ingredientsClass: "accordian",
          carrotClass: "carrot rotate",
          isOpen: true
        });
      }
      // Read more Click
    } else if (event.target.className.includes("learn-more-button")) {
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
        .get(`http://localhost:4000/recipes/ingredients/${id}`)
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
      <div className="card-header">
        <h2 className="recipe-name">{recipe["recipe-name"]}</h2>
        {/* <div className="card-menu" onClick={handleClick}> */}
          <CardMenu className="card-menu" handleClick={handleClick} dropdown={dropdown} />
        {/* </div>/ */}
      </div>

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
          className={`learn-more-button ${recipeDescription.showButton ? "" : "hidden"}`}
          onClick={handleClick}
        >
          {recipeDescription.buttonText}
        </button>
        <button className={`${accordian.carrotClass} carrot-button`} onClick={handleClick}>
          <svg
            className="carrot"
            // onClick={handleClick}
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
