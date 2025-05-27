import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access_token");

  const isAuthenticated = !!accessToken;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
