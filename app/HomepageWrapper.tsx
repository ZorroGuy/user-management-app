"use client";

import React from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import Homepage from "./Home/page";
import { store } from "./redux/store";

const HomepageWrapper: React.FC = () => {
  return (
    <Provider store={store}>
      <Homepage />
      <ToastContainer />
    </Provider>
  );
};

export default HomepageWrapper;
