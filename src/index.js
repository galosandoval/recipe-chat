import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./features/App";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "react-query";
// import { ReactQueryDevtools } from "react-query/devtools";
import { queryClient } from "./features/utils/react-query-client";
import { AuthProvider } from "./features/utils/auth-config";

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
  </QueryClientProvider>,
  document.getElementById("root")
);
