import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/Router";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ConfirmProvider } from "./components/modal/ConfirmModal";
import { CallProvider } from "./features/call/CallProvider";
import CallOverlay from "./features/call/components/CallOverlay";

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} style={{ zIndex: 99999 }} />

      <Provider store={store}>
        <ConfirmProvider>
          <CallProvider>
            <RouterProvider router={router} />
            <CallOverlay />
          </CallProvider>
        </ConfirmProvider>
      </Provider>
    </>
  );
}

export default App;
