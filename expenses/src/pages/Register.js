import React, { useState } from "react";
import { registerUser } from "../api";
import "../styles/AuthForm.css";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await registerUser(form);

      const token = res.data.access_token || res.data.token;
      if (!token) throw new Error("No token received from server");

      onRegister(token);
    } catch (err) {
      const text =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        "Registration failed";
      setMsg(text);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Sign up to get started</p>

        <form className="auth-form" onSubmit={submit}>
          {msg && <div className="error">{msg}</div>}

          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="signin-btn">Register</button>
        </form>

        <p className="signup-text">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
