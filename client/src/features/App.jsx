import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";

import { Grocerylist } from "./grocerylist/Grocerylist";
import { Login } from "./login/Login";
import { Navbar } from "./navbar/Navbar";
import { LoadingCards } from "./status/Loading.Cards";

const Recipe = lazy(() => import("./recipe/Recipe"));

function App() {
  // TODO: Replace hardcoded '1' with logged in users ID

  return (
    <div className="App">
      <Login />
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
