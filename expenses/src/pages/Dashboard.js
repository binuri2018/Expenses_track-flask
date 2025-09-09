import React, { useEffect, useState, useCallback } from "react";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "../api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/Dashboard.css";

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#845EC2"];
const categories = ["Food & Dining", "Entertainment", "Travel", "Bills", "Other"];

export default function Dashboard({ token, onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", category: "", amount: "" });
  const [editingId, setEditingId] = useState(null);

  // ✅ Load expenses
  const loadExpenses = useCallback(async () => {
    try {
      const res = await getExpenses(token);
      setExpenses(res.data.expenses);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    }
  }, [token]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateExpense(token, editingId, form);
        setEditingId(null);
      } else {
        await addExpense(token, form);
      }
      setForm({ title: "", category: "", amount: "" });
      loadExpenses();
    } catch (err) {
      console.error("Failed to submit expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(token, id);
      loadExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
    }
  };

  const handleEdit = (expense) => {
    setForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
    });
    setEditingId(expense._id);
  };

  // Summary Data
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const avgExpense = totalExpenses ? (totalAmount / totalExpenses).toFixed(2) : 0;

  // Chart Data
  const categoryData = categories.map((cat) => ({
    name: cat,
    value: expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + Number(e.amount), 0),
  }));

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="text-3xl font-bold">💰 Expense Tracker</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* ✅ Add Expense Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <input
            type="text"
            name="title"
            placeholder="Expense Title"
            value={form.title}
            onChange={handleChange}
            className="p-2 rounded bg-gray-700"
            required
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="p-2 rounded bg-gray-700"
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            className="p-2 rounded bg-gray-700"
            required
          />
          <button type="submit" className="bg-green-500 px-4 py-2 rounded-lg">
            {editingId ? "Update" : "Add"} Expense
          </button>
        </form>
      </div>

      {/* ✅ Expenses Table */}
      <div className="expenses-table">
        <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-600">
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id} className="border-b border-gray-700">
                <td>{e.title}</td>
                <td>{e.category}</td>
                <td>${e.amount}</td>
                <td>{e.date}</td>
                <td>
                  <button onClick={() => handleEdit(e)} className="action-btn">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    className="action-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Summary + Charts */}
      <div className="summary-box">
        <h2 className="text-xl font-semibold mb-4">Expense Summary</h2>
        <div className="flex gap-6 mb-6">
          <div className="p-4 bg-gray-700 rounded-lg">
            <p>Total Expenses</p>
            <h3 className="text-2xl font-bold">{totalExpenses}</h3>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p>Total Spent</p>
            <h3 className="text-2xl font-bold">${totalAmount}</h3>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <p>Average Expense</p>
            <h3 className="text-2xl font-bold">${avgExpense}</h3>
          </div>
        </div>

        {/* ✅ Charts */}
        <div className="chart-container">
          {/* Pie Chart */}
          <ResponsiveContainer width={300} height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>

          {/* Bar Chart */}
          <div style={{ width: "500px", height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* ✅ Custom Legend */}
            <div className="legend-container mt-4">
              <h3 className="font-semibold mb-2">Category Colors</h3>
              <ul className="flex flex-wrap gap-4">
                {categoryData.map((entry, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: "3px",
                      }}
                    ></span>
                    {entry.name}
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
