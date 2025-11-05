// src/components/RequireAdmin.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = (() => {
    try {
      return localStorage.getItem("isAdmin") === "true" || Boolean(localStorage.getItem("admin_token"));
    } catch {
      return false;
    }
  })();

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;
