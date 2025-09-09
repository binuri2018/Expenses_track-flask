import React, { useState } from "react";
import { loginUser } from "../api";
import "../styles/AuthForm.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await loginUser(form);

      const token = res.data.access_token || res.data.token;
      if (!token) throw new Error("No token received from server");

      onLogin(token);
    } catch (err) {
      const text =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        "Login failed";
      setMsg(text);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <form className="auth-form" onSubmit={submit}>
          {msg && <div className="error">{msg}</div>}

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@example.com"
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

          <button type="submit" className="signin-btn">Sign In</button>
        </form>

        <p className="signup-text">
          Don’t have an account? <a href="/register">Sign up here</a>
        </p>
      </div>
    </div>
  );
}
