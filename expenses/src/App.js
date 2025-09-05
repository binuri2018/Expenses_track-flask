import React, { useState, useEffect } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { fetchProfile } from "./api";
import "./styles/App.css";

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true); // toggle between login/register

  // Check localStorage token on mount
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

  // Sync token with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  if (loading) return <div>Loading...</div>;

  if (token) {
    return <Dashboard token={token} onLogout={() => setToken(null)} />;
  }

  return (
    <div className="app-container">
      <h1>Flask + React Auth</h1>

      <div className="auth-container">
        {showLogin ? (
          <>
            <Login onLogin={(t) => setToken(t)} />
            <p>
              Don't have an account?{" "}
              <button onClick={() => setShowLogin(false)}>Register</button>
            </p>
          </>
        ) : (
          <>
            <Register onRegister={(t) => setToken(t)} />
            <p>
              Already have an account?{" "}
              <button onClick={() => setShowLogin(true)}>Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
