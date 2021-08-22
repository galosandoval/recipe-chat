import React from "react";
import styled from "styled-components";
import { RecipeCard } from "./RecipeCard";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  .recipes-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
`

export const Recipes = ({ recipes }) => {
  return (
    <StyledDiv className="recipes">
      <h1>Recipes</h1>
      <div className="recipes-container">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </StyledDiv>
  );
};
