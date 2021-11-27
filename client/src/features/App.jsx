import React, { createContext, lazy, Suspense, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { Grocerylist } from "./grocerylist/Grocerylist";
import { Login } from "./auth/Login";
import { Navbar } from "./navbar/Navbar";
import { LoadingCards } from "./status/Loading.Cards";
import { Register } from "./auth/Register";

const Recipe = lazy(() => import("./recipe/Recipe"));

function App() {
  // TODO: Replace hardcoded '1' with logged in users ID
  const loggedIn = localStorage.getItem("token");

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          {loggedIn ? <Redirect to="/grocerylist" /> : <Login />}
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/grocerylist">
          {loggedIn ? (
            <>
              <Navbar />
              <Grocerylist />
            </>
          ) : (
            <Redirect to="/" exact />
          )}
        </Route>
        <Route path="/recipes">
          {loggedIn ? (
            <Suspense fallback={<LoadingCards />}>
              <Navbar />
              <Recipe />
            </Suspense>
          ) : (
            <Redirect to="/" exact />
          )}
        </Route>
      </Switch>
    </div>
  );
}

export default App;
