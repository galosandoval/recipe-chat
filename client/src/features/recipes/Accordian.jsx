import React, { useLayoutEffect } from "react";
import { RecipeIngredients } from "./RecipeIngredients";
import { RecipeInstructions } from "./RecipeInstructions";

// TODO: make tabs for Recipes and Ingredients
export const Accordian = ({ instructions, ingredients, accordian, index }) => {
  // const [tab, setTab] = useState();
  // const adjustAccordianHeight = (event) => {
  //   console.log(event.target.innerHTML);
  //   if (event.target.innerHTML === "Recipe") {
  //   }
  //   // const openAccordian = document.querySelectorAll(".accordian");
  //   //  if (openAccordian) {
  //   //    openAccordian[index].style.maxHeight = `${openAccordian[index].scrollHeight}px`;
  //   // }
  //   const instructions = document.querySelector(".instructions");
  //   const ingredients = document.querySelector(".ingredients");
  //   console.log(instructions, "instructions");
  //   console.log(ingredients, "ingredients");
  // };

  useLayoutEffect(() => {
    const openAccordian = document.querySelectorAll(".accordian");
    if (openAccordian) {
      openAccordian[index].style.maxHeight = `${openAccordian[index].scrollHeight}px`;
    }
  });
  return (
    <div className={accordian.ingredientsClass}>
      <div className="links">
        {/* <Link onClick={adjustAccordianHeight} className="link" to={`/recipes/ingredients/${id}`}> */}
        {/* Ingredients */}
        {/* </Link> */}
        {/* <Link onClick={adjustAccordianHeight} className="link" to={`/recipes/instructions/${id}`}> */}
        {/* Recipe */}
        {/* </Link> */}
      </div>
      {/* <Switch>
        <Route path={`/recipes/ingredients/${id}`}> */}
      <RecipeIngredients ingredients={ingredients} />
      {/* </Route> */}
      {/* <Route path={`/recipes/instructions/${id}`}> */}
      <RecipeInstructions instructions={instructions} />
      {/* </Route>
      </Switch> */}
    </div>
  );
};
