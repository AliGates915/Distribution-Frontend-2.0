import React from "react";
import ReactDOM from "react-dom/client";
import AppProviders from "./AppProviders";
import "./index.css"; // or your main CSS file

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>
);
