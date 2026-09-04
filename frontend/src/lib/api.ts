import axios from "axios";
import { clearAuthStorage } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const LOGIN_URL = "/api/v1/auth/login";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error?.config?.url === LOGIN_URL;
    const isOnLoginPage = window.location.pathname === "/login";

    if (error?.response?.status === 401 && !isLoginRequest && !isOnLoginPage) {
      clearAuthStorage();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
