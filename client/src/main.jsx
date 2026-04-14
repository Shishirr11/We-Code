import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
=======
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { store } from "./store";
import { Provider } from "react-redux";
ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
<<<<<<< HEAD
=======
  //</React.StrictMode>
>>>>>>> 9dc63e5fe5932ea5a0688fb55425d87bac24ab60
);
