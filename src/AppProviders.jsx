import React from "react";
import { Provider } from "react-redux";
import store from "./context/store"; // adjust path if needed
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const AppProviders = () => (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

export default AppProviders;
