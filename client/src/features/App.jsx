import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";

import { Grocerylist } from "./grocerylist/Grocerylist";
import { Login } from "./auth/Login";
import { Navbar } from "./navbar/Navbar";
import { LoadingCards } from "./status/Loading.Cards";
import { Register } from "./auth/Register";

const Recipe = lazy(() => import("./recipe/Recipe"));

function App() {
  // TODO: Replace hardcoded '1' with logged in users ID

  return (
    <div className="App">
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
      </Switch>
      <Route path="/register">
        <Register />
      </Route>
      {/* <Navbar />
      <Switch>
        <Route path="/" exact>
          <Grocerylist />
        </Route>
        <Route path="/recipes">
          <Suspense fallback={<LoadingCards />}>
            <Recipe />
          </Suspense>
        </Route>
      </Switch> */}
    </div>
  );
}

export default App;
