import React, { useState, useEffect } from "react";
import { fetchProfile, getExpenses, addExpense, deleteExpense } from "../api";
import "../styles/Dashboard.css";

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "" });
  const [msg, setMsg] = useState(null);

  // Load user info & expenses on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await fetchProfile(token);
        setUser(profile.data.user);

        const exp = await getExpenses(token);
        setExpenses(exp.data.expenses);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [token]);

  // Handle form input change
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Add expense
  const handleAdd = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await addExpense(token, form);
      setExpenses([...expenses, res.data.expense]);
      setForm({ title: "", amount: "" });
    } catch (err) {
      setMsg(err?.response?.data?.msg || "Error adding expense");
    }
  };

  // Delete expense
  const handleDelete = async (id) => {
    try {
      await deleteExpense(token, id);
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Welcome, {user.username}</h2>
      <button onClick={onLogout}>Logout</button>

      <h3>Add Expense</h3>
      {msg && <div className="error">{msg}</div>}
      <form onSubmit={handleAdd} className="expense-form">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <input
          name="amount"
          type="number"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <button type="submit">Add</button>
      </form>

      <h3>My Expenses</h3>
      <ul className="expense-list">
        {expenses.map((e) => (
          <li key={e._id}>
            {e.title} - ${e.amount.toFixed(2)}
            <button onClick={() => handleDelete(e._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
