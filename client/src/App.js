import React from "react";
import { Route } from "react-router-dom";
import Auth from "./auth/Auth";

import { Home } from "./features/home/Home";
import { Profile } from "./features/profile/Profile";
import { Nav } from "./Nav";

function App(props) {
  const auth = new Auth(props.history);
  return (
    <div className="App">
      <Nav />
      <Route
        path="/"
        exact
        render={(props) => <Home auth={auth} {...props} />}
      />
      <Route path="/profile" component={Profile} />
    </div>
  );
}

export default App;
