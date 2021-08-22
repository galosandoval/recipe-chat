import React from "react";
import styled from "styled-components";
import { GroceryListContainer } from "./GroceryListContainer";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  .grocery-list-container {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }
`;

export const GroceryLists = ({ groceryLists }) => {
  console.log(groceryLists);

  return (
    <StyledDiv>
      <div className="title">
        <h1>GroceryLists</h1>
      </div>
      <div className="grocery-list-container">
        {groceryLists.map((groceryList) => (
          <GroceryListContainer
            key={groceryList.id}
            groceryList={groceryList}
          />
        ))}
      </div>
    </StyledDiv>
  );
};
