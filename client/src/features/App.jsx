import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

import { Grocerylist } from "./Grocerylist/Grocerylist";
import { Navbar } from "./navbar/Navbar";
import { Recipe } from "./recipe/Recipe";

function App() {
  const [grocerylist, setGrocerylist] = useState([]);
  const [recipes, setRecipes] = useState([]);

  // TODO: Replace hardcoded '1' with logged in users ID
  const getGroceryLists = () => {
    axios.get("http://localhost:4000/recipes-grocery-lists/gl/user/1").then((res) => {
      setGrocerylist(res.data.groceryLists);
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
      <Switch>
        <Route path="/recipes">
          <Recipe recipes={recipes} getRecipes={getRecipes} />
        </Route>
        <Route path="/">
          <Grocerylist grocerylist={grocerylist} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
