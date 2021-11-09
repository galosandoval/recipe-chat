import React, { useEffect, useState } from "react";
import axios from "axios";
import { Accordian } from "./Accordian";
import { CardMenu } from "./CardMenu";
import { EditRecipe } from "./edit/EditRecipe";
import { EditInstructions } from "./edit/EditInstructions";
import { EditIngredients } from "./edit/EditIngredients";
import { useHistory } from "react-router-dom";

const initialAccordianState = {
  ingredientsClass: "accordian accordian--hidden",
  carrotClass: "recipe-card__carrot-button",
  isOpen: false,
  style: { maxHeight: 0 }
};
const initialDescriptionState = (recipe) => {
  return {
    description:
      recipe.description.length > 65 ? recipe.description.slice(0, 60) + "..." : recipe.description,
    isOpen: false,
    buttonText: "Read more",
    showButton: recipe.description.length > 65
  };
};
const initialDropdownState = {
  class: "card-menu__content",
  open: false
};
const initialEditCardState = {
  class: "edit-card",
  open: false
};
const initialEditInstructionsState = {
  class: "edit-card",
  open: false
};
const initialEditIngredientsState = {
  class: "edit-card",
  open: false
};

export const RecipeCard = ({ recipe, index, closeOpenCarrots }) => {
  const [recipeDescription, setRecipeDescription] = useState(initialDescriptionState(recipe));
  const [accordian, setAccordian] = useState(initialAccordianState);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [dropdown, setDropdown] = useState(initialDropdownState);
  const [editRecipe, setEditRecipe] = useState(initialEditCardState);
  const [editInstructions, setEditInstructions] = useState(initialEditInstructionsState);
  const [editIngredients, setEditIngredients] = useState(initialEditIngredientsState);
  const history = useHistory();

  const handleClick = (event) => {
    const { className } = event.currentTarget;
    console.log("class", className);
    // Edit Menu Click
    if (
      className === "card-menu__dropdown-btn" &&
      !editRecipe.open &&
      !editInstructions.open &&
      !editIngredients.open
    ) {
      closeOpenCarrots();
      !dropdown.open
        ? setDropdown({
            class: "card-menu__content card-menu__content--show",
            open: true
          })
        : setDropdown(initialDropdownState);
    } else if (className === "card-menu__closedrop-btn") {
      setEditRecipe(initialEditCardState);
      setEditInstructions(initialEditCardState);
      setEditIngredients(initialEditIngredientsState);
    } else if (className === "card-menu__edit-btn") {
      setDropdown(initialDropdownState);
      setEditRecipe({ class: "edit-card edit-card--show", open: true });
    } else if (className === "card-menu__instructions-btn") {
      setDropdown(initialDropdownState);
      setEditInstructions({ class: "edit-card edit-card--show", open: true });
    } else if (className === "card-menu__ingredients-btn") {
      setDropdown(initialDropdownState);
      setEditIngredients({ class: "edit-card edit-card--show", open: true });
      // Carrot Click
    } else if (className.includes("recipe-card__carrot-button")) {
      closeOpenCarrots();
      history.push("/recipes/ingredients");

      if (accordian.isOpen) {
        setAccordian(initialAccordianState);
      } else if (!accordian.isOpen) {
        setAccordian({
          ingredientsClass: "accordian",
          carrotClass: "recipe-card__carrot-button recipe-card__carrot-button--rotate",
          isOpen: true
        });
      }
    } else if (className === "recipe-card__learn-button") {
      if (recipeDescription.isOpen) {
        setRecipeDescription(initialDescriptionState(recipe));
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
      .get(`http://localhost:4000/instructions/recipe/${id}`)
      .then((instructions) => {
        setInstructions(instructions.data.recipeInstructions);
      })
      .catch((err) => console.log({ err }));
  };

  useEffect(() => {
    getRecipeInstructions(recipe.id);
    getRecipeIngredients(recipe.id);
  }, [recipe.id]);

  return (
    <div id={recipe["recipe-name"]} className="card recipe-card">
      {/**
       * TODO: Make toast when something is updated or deleted
       */}
      <EditRecipe recipe={recipe} editRecipe={editRecipe} />
      <EditInstructions
        getRecipeInstructions={getRecipeInstructions}
        editInstructions={editInstructions}
        instructions={instructions}
        recipe={recipe}
      />
      <EditIngredients
        getRecipeIngredients={getRecipeIngredients}
        recipe={recipe}
        editIngredients={editIngredients}
        ingredients={ingredients}
      />
      <div className="card-header recipe-card__header">
        <h2 className="recipe-name recipe-card__name">{recipe["recipe-name"]}</h2>
        <CardMenu
          editRecipe={editRecipe}
          editInstructions={editInstructions}
          editIngredients={editIngredients}
          handleClick={handleClick}
          dropdown={dropdown}
          setDropdown={setDropdown}
          initialDropdownState={initialDropdownState}
        />
      </div>

      <div className="recipe-card__img-container">
        <img
          className="recipe-card__img"
          src={
            recipe["img-url"] ||
            "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y29va2luZyUyMHBvdHxlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          }
          alt={recipe["recipe-name"] || "orange pot"}
        />
      </div>

      <div className="recipe-card__description">
        <p>{recipeDescription.description}</p>
        <button
          className={
            recipeDescription.showButton
              ? "recipe-card__learn-button"
              : "recipe-card__learn-button recipe-card__learn-button--hidden"
          }
          onClick={handleClick}
        >
          {recipeDescription.buttonText}
        </button>
        <button className={`${accordian.carrotClass}`} onClick={handleClick}>
          <svg
            className="recipe-card__carrot-button--svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="grey"
          >
            <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
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
