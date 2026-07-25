import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmProvider } from "./components/modal/ConfirmModal";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 99999 }} />

      <Provider store={store}>
        <ConfirmProvider>
          <RouterProvider router={router} />
        </ConfirmProvider>
      </Provider>
    </>
  );
}

export default App;
