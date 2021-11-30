import React, { lazy, Suspense } from "react";
import { Route, Switch } from "react-router-dom";

import { Grocerylist } from "./grocerylist/Grocerylist";
import { Login } from "./auth/Login";
import { Navbar } from "./navbar/Navbar";
import { LoadingCards } from "./status/Loading.Cards";
import { Register } from "./auth/Register";
import { useAuth } from "./utils/auth";

const Recipe = lazy(() => import("./recipe/Recipe"));

function App() {
  const { user } = useAuth();
  return (
    <div className="App">
      {!!user ? (
        <>
          <Navbar />
          <Switch>
            <Route exact path="/">
              <Grocerylist />
            </Route>
            <Route path="/recipes">
              <Suspense fallback={<LoadingCards />}>
                <Recipe />
              </Suspense>
            </Route>
          </Switch>
        </>
      ) : (
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
        </Switch>
      )}
    </div>
  );
}

export default App;
