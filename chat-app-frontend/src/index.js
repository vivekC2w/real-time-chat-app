import React from "react";
import ReactDOM from "react-dom/client";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import store from "./redux/store";
import SignIn from "./components/Auth/SignIn";
import ChatPage from "./components/Chat/ChatPage";
import SignUp from "./components/Auth/SignUp";

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/signin" replace/>
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </Router>
    </Provider>
);
