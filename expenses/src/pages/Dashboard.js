import React, { useEffect, useState } from "react";
import { fetchProfile } from "../api";
import "../styles/Dashboard.css";

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchProfile(token);
        setUser(res.data.user);
      } catch (err) {
        setMsg("Session expired or invalid token. Please login again.");
      }
    };
    load();
  }, [token]);

  return (
    <div className="dashboard">
      {msg && <div className="error">{msg}</div>}
      {user ? (
        <>
          <h2>Welcome, {user.username}</h2>
          <p>Email: {user.email}</p>
          <button onClick={() => onLogout()}>Logout</button>
        </>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}
