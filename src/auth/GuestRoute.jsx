import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext"; 

const GuestRoute = ({ children }) => {
  const { currentUser } = useAuth(); 

  return currentUser ? <Navigate to="/" /> : children;
};

export default GuestRoute;
