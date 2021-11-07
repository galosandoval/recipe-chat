import React, { useEffect, useRef, useState } from "react";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

import { Grocerylist } from "./Grocerylist/Grocerylist";
import { Navbar } from "./navbar/Navbar";
import { Recipes } from "./recipes/Recipes";

function App() {
  const [grocerylist, setGrocerylist] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const myRef = useRef(null);

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
          <Recipes myRef={myRef} recipes={recipes} getRecipes={getRecipes} />
        </Route>
        <Route path="/">
          <Grocerylist grocerylist={grocerylist} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
