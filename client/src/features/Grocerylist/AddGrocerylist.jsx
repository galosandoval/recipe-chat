import React, { useEffect, useState } from "react";
import { checkSVG } from "../../utils/svgs";
import { Loading } from "../status/Loading";
import { useCreateGrocerylist, useCreateRecipes } from "../services/grocerylist";
import { queryClient } from "../services/react-query-client";
import { useGetRecipes } from "../services/recipes";
import { AddGrocerylistCheckboxes } from "./AddGrocerylistCheckboxes";

const initialGrocerylistState = "";

export const AddGrocerylist = ({ form }) => {
  // TODO:  change user id in here
  const { data: recipes, isLoading, isError, error } = useGetRecipes(1);
  const createGrocerylist = useCreateGrocerylist(recipes);
  const createRecipes = useCreateRecipes();

  const [checked, setChecked] = useState([]);
  const [grocerylistToAdd, setGrocerylistToAdd] = useState(initialGrocerylistState);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const grocerylistBody = { name: grocerylistToAdd, "user-id": recipes[0]["user-id"] };
    await createGrocerylist.mutateAsync(grocerylistBody);

    const newGroceryListId = queryClient.getQueryData(["grocerylist", { "user-id": 1 }]).data
      .groceryListId[0];
    const recipesBody = recipes
      .filter((_r, i) => checked[i])
      .map((r) => ({
        "recipe-id": r.id,
        "grocery-list-id": newGroceryListId,
        "user-id": recipes[0]["user-id"]
      }));
    createRecipes.mutate(recipesBody);

    setGrocerylistToAdd(initialGrocerylistState);
    setChecked(checked.map((c) => (c ? !c : c)));
  };

  useEffect(() => {
    if (recipes) setChecked(() => new Array(recipes.length).fill(false));
  }, [recipes]);

  if (isError) return <h1>{error}</h1>;
  return (
    <form className={form.formClass} onSubmit={handleSubmit}>
      <div className="add-form__container">
        <label htmlFor="name" className="add-form__label add-form__label-name">
          Name
          <input
            type="text"
            className="add-form__input"
            placeholder="Gordon Ramsay's Recipes"
            value={grocerylistToAdd}
            onChange={(event) => setGrocerylistToAdd((e) => event.target.value)}
            required
          />
        </label>
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
      <button className="add-form__btn add-btn-submit" type="submit">
        {form.isAdded ? "Grocerylist Added" : "Add Grocerylist"}
        <span className={form.addButtonClass}>{checkSVG}</span>
      </button>
    </form>
  );
};
