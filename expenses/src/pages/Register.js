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

      // Check for both cases depending on your Flask response
      const token = res.data.access_token || res.data.token;

      if (!token) {
        throw new Error("No token received from server");
      }

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
    <form className="auth-form" onSubmit={submit}>
      {msg && <div className="error">{msg}</div>}

      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />

      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />

      <button type="submit">Register</button>
    </form>
  );
}
