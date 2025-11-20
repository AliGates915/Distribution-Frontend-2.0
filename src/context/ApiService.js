// src/context/apiService.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 🔹 Generic request wrapper
const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`API ${method.toUpperCase()} ${endpoint} failed:`, error);
    throw error.response?.data || error;
  }
};

// 🔹 CRUD shortcuts
export const api = {
  get: (endpoint, config) => apiRequest("get", endpoint, null, config),
  post: (endpoint, data, config) => apiRequest("post", endpoint, data, config),
  put: (endpoint, data, config) => apiRequest("put", endpoint, data, config),
  patch: (endpoint, data, config) => apiRequest("patch", endpoint, data, config),
  delete: (endpoint, config) => apiRequest("delete", endpoint, null, config),
};
