import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

import { GroceryLists } from "./features/groceryLists/GroceryLists";
import { Profile } from "./features/profile/Profile";
import { Navbar } from "./features/navbar/Navbar";
import { Recipes } from "./features/recipes/Recipes";

function App() {
  const [groceryLists, setGroceryLists] = useState([]);
  const getGroceryLists = () => {
    axios.get("http://localhost:4000/grocery-lists/recipes/1").then((res) => {
      setGroceryLists(res.data.groceryListRecipes);
    });
  };
  useEffect(() => {
    getGroceryLists();
  }, []);
  return (
    <div className="App">
      <Navbar />
      <Switch>
        <Route path="/profile">
          <Profile />
        </Route>
        <Route path="/recipes">
          <Recipes />
        </Route>
        <Route path="/">
          <GroceryLists groceryLists={groceryLists} />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
