import { useMemo, useState } from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
  padding: 30px;

  .hidden {
    display: none;
  }
`;

export const GroceryListCard = ({ groceryList }) => {
  const [isOpen, setIsOpen] = useState(false);

  const mappedIngredients = (ingredientsArray) => {
    return ingredientsArray.map((ingredient) => (
      <div key={ingredient} className="ingredient">
        {ingredient} <input disabled type="checkbox" />
      </div>
    ));
  };

  const memoizedIngredients = useMemo(
    () => mappedIngredients(groceryList.ingredients),
    [groceryList.ingredients]
  );

  const handleClick = (event) => {
    event.preventDefault();
    isOpen === true ? setIsOpen(false) : setIsOpen(true);
  };

  return (
    <StyledDiv
      className="grocery-list"
      key={groceryList.id}
      onClick={handleClick}
    >
      <h2>{groceryList["grocery-list-name"]}</h2>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo fuga
        corporis modi pariatur deserunt porro incidunt nostrum velit possimus
        recusandae.
      </p>
      <div
        className={
          isOpen ? "ingredients-container" : "ingredients-container hidden"
        }
      >
        {memoizedIngredients}
      </div>
      <div className={isOpen ? null : "hidden"}>hello</div>
    </StyledDiv>
  );
};
