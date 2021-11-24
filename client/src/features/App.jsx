import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

import { Grocerylist } from "./grocerylist/Grocerylist";
import { Navbar } from "./navbar/Navbar";
import { Recipe } from "./recipe/Recipe";

function App() {
  const [recipes, setRecipes] = useState([]);

  // TODO: Replace hardcoded '1' with logged in users ID

  const getRecipes = () => {
    axios.get("http://localhost:4000/recipes/user/1").then((recipes) => {
      setRecipes(recipes.data.recipes);
    });
  };

  useEffect(() => {
    getRecipes();
  }, []);
  return (
    <div className="App">
      <Navbar />
      <Switch>
        <Route path="/" exact>
          <Grocerylist />
        </Route>
        <Route path="/recipes">
          <Recipe recipes={recipes} getRecipes={getRecipes} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
