import React, { useEffect, useState } from "react";
import { useCreateGrocerylist, useCreateRecipes } from "../../services/grocerylistService";
import { useGetRecipes } from "../../services/recipeService";
import { Loading } from "../../status/Loading";
import { queryClient } from "../../utils/react-query-client";
import { storage } from "../../utils/storage";
import { AddGrocerylistCheckboxes } from "./AddGrocerylistCheckboxes";
const userId = storage.getUserId();

export const AddGroceryList = () => {
  const { data: recipes, isLoading } = useGetRecipes(userId);
  const createGrocerylist = useCreateGrocerylist();
  const createRecipes = useCreateRecipes();

  const [checked, setChecked] = useState([]);
  const [grocerylistFormStyle, setGrocerylistFormStyle] = useState(0);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState("");

  const handleNext = (event) => {
    const { name } = event.target;
    if (name === "next") {
      setGrocerylistFormStyle((state) => state - 100);
      setCount((state) => state + 1);
    }
  };

  const handleSubmit = async () => {
    const reqBody = {
      "user-id": userId,
      name: input
    };
    await createGrocerylist.mutateAsync(reqBody);

    const newGroceryListId = queryClient.getQueryData(["grocerylist", { "user-id": userId }]).data
      .groceryListId[0];
    const recipesToAdd = recipes.reduce((toAddArr, recipe, index) => {
      if (checked[index])
        toAddArr.push({
          "recipe-id": recipe.id,
          "grocery-list-id": newGroceryListId,
          "user-id": userId
        });
      return toAddArr;
    }, []);
    await createRecipes.mutateAsync(recipesToAdd);

    setChecked(checked.map((c) => (c ? !c : c)));
    setInput("");

    setTimeout(() => {
      setGrocerylistFormStyle(0);
      createGrocerylist.reset();
      document.querySelector("#form").click();
    }, 2000);
  };

  useEffect(() => {
    if (recipes) setChecked(() => new Array(recipes.length).fill(false));
  }, [recipes]);

  return (
    <>
      <form
        className="form-container-grocerylist"
        style={{
          transform: `translateX(${grocerylistFormStyle}%)`
        }}
      >
        <label className="form-container-grocerylist__label form-container-grocerylist__label-name">
          Name
          <input
            type="text"
            className="form-container-grocerylist__input"
            placeholder="Gordon Ramsay's Recipes"
            required
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </label>
        <div className="form-container-grocerylist__checkboxes">
          {isLoading || checked.length === 0 ? (
            <Loading />
          ) : (
            recipes.map((r, i) => (
              <AddGrocerylistCheckboxes
                r={r}
                index={i}
                checked={checked}
                setChecked={setChecked}
                key={r.id}
              />
            ))
          )}
        </div>
      </form>
      {count === 1 ? (
        <button
          onClick={handleSubmit}
          className="form-container-grocerylist__btn add-btn-submit"
          type="submit"
          name="submit"
        >
          {createGrocerylist.isSuccess && createRecipes.isSuccess
            ? "Success"
            : createGrocerylist.isLoading || createRecipes.isLoading
            ? "Adding..."
            : "Save"}
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="form-container-grocerylist__btn add-btn-submit"
          type="submit"
          name="next"
          disabled={count === 0 && input === ""}
        >
          Next
        </button>
      )}
    </>
  );
};
