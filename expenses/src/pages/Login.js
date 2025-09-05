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

      // Adjust depending on your Flask response
      const token = res.data.access_token || res.data.token;

      if (!token) {
        throw new Error("No token received from server");
      }

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
    <form className="auth-form" onSubmit={submit}>
      {msg && <div className="error">{msg}</div>}

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

      <button type="submit">Login</button>
    </form>
  );
}
