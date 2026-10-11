import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EmployeePortal from "./EmployeePortal";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  const loadUserData = () => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const parsedData = JSON.parse(savedUser);
        setToken(savedToken);
        const role =
          parsedData.role ||
          (parsedData.user && parsedData.user.role) ||
          "employee";
        setUserRole(role);
      } catch (e) {
        console.error("User parsing error:", e);
      }
    } else {
      setToken(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLoginSuccess = () => {
    loadUserData();
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/"
        element={
          !token ? (
            <Navigate to="/login" replace />
          ) : userRole === "admin" ? (
            <Dashboard onLogout={handleLogout} />
          ) : (
            <EmployeePortal onLogout={handleLogout} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;