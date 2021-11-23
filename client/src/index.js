import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./features/App";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./features/services/react-query-client";

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <App />
    </Router>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
  document.getElementById("root")
);
