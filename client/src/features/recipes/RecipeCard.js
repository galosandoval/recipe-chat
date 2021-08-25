import React, { useEffect, useState } from "react";
import axios from "axios";
import { StyledCard } from "../../styles/cardStyle";
import { Accordian } from "./Accordian";
import { useHistory } from "react-router-dom";

const initialAccordianState = {
  ingredientsClass: "hidden",
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
  const [instructions, setInstructions] = useState([]);

  const history = useHistory();

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

  const closeOpenCarrots = () => {
    const carrots = document.querySelectorAll(".carrot");
    carrots.forEach((carrot) => {
      if (carrot.classList[1] === "rotate") carrot.click();
    });
  };

  const handleClick = (event) => {
    event.preventDefault();

    if (event.target.className.includes("carrot")) {
      closeOpenCarrots();

      history.push(`/recipes/ingredients/${recipe.id}`);

      if (accordian.isOpen) {
        setAccordian(initialAccordianState);
      } else {
        setAccordian({
          ingredientsClass: "ingredients",
          carrotClass: "carrot rotate",
          isOpen: true
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
    getRecipeInstructions(recipe.id);
    getRecipeIngredients(recipe.id);
  }, [recipe.id]);
  return (
    <StyledCard>
      <h2>{recipe["recipe-name"]}</h2>
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
        <p onClick={handleClick} className={accordian.carrotClass}>
          {">"}
        </p>
      </div>

      <div className={accordian.ingredientsClass}>
        <Accordian instructions={instructions} ingredients={ingredients} id={recipe.id} />
      </div>
    </StyledCard>
  );
};
