import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

import { GroceryLists } from "./features/groceryLists/GroceryLists";
import { Profile } from "./features/profile/Profile";
import { Navbar } from "./features/navbar/Navbar";
import { Recipes } from "./features/recipes/Recipes";

function App() {
  const [groceryLists, setGroceryLists] = useState([]);
  const [recipes, setRecipes] = useState([]);

  // TODO: Replace hardcoded '1' with logged in users ID
  const getGroceryLists = () => {
    axios.get("http://localhost:4000/grocery-lists/recipes/1").then((res) => {
      setGroceryLists(res.data.groceryListRecipes);
    });
  };
  const getRecipes = () => {
    axios.get("http://localhost:4000/recipes/user/1").then((recipes) => {
      setRecipes(recipes.data.recipes);
    });
  };
  useEffect(() => {
    getGroceryLists();
    getRecipes();
  }, []);
  return (
    <div className="App">
      <Navbar />
      {/* TODO: create + button which adds recipes and creates grocery lists */}
      <Switch>
        <Route path="/profile">
          <Profile />
        </Route>
        <Route path="/recipes">
          <Recipes recipes={recipes} getRecipes={getRecipes} />
        </Route>
        <Route path="/">
          <GroceryLists groceryLists={groceryLists} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
