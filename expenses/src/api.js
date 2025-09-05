import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api";

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
