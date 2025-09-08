import axios from "axios";

const BASE_URL = "https://expenses-track-flask-1.onrender.com";

// -------------------
// Auth routes
// -------------------
export const registerUser = (payload) => {
  return axios.post(`${BASE_URL}/auth/register`, payload);
};

export const loginUser = (payload) => {
  return axios.post(`${BASE_URL}/auth/login`, payload);
};

export const fetchProfile = (token) => {
  return axios.get(`${BASE_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// -------------------
// Expense routes
// -------------------
export const getExpenses = (token) => {
  return axios.get(`${BASE_URL}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const addExpense = (token, expense) => {
  return axios.post(`${BASE_URL}/expenses`, expense, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteExpense = (token, id) => {
  return axios.delete(`${BASE_URL}/expenses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateExpense = (token, id, payload) => {
  return axios.put(`${BASE_URL}/expenses/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default {
  registerUser,
  loginUser,
  fetchProfile,
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
};
