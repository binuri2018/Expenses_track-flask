import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { fetchProfile } from "./api";
import "./styles/App.css";

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      fetchProfile(storedToken)
        .then(() => setToken(storedToken))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {token ? (
          <Route path="/*" element={<Dashboard token={token} onLogout={() => setToken(null)} />} />
        ) : (
          <>
            <Route path="/login" element={<Login onLogin={(t) => setToken(t)} />} />
            <Route path="/register" element={<Register onRegister={(t) => setToken(t)} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

