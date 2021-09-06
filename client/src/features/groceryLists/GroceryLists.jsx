import React, { useMemo } from "react";
import styled from "styled-components";
import { GroceryListCard } from "./GroceryListCard";

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
  const mappedGroceryLists = (groceryListsArray) => {
    return groceryListsArray.map((groceryList) => (
      <GroceryListCard key={groceryList.id} groceryList={groceryList} />
    ));
  };
  const memoizedGroceryLists = useMemo(
    () => mappedGroceryLists(groceryLists),
    [groceryLists]
  );

  return (
    <StyledDiv>
      <div className="title">
        <h1>GroceryLists</h1>
      </div>
      <div className="grocery-list-container">{memoizedGroceryLists}</div>
    </StyledDiv>
  );
};
