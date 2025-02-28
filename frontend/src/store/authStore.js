import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/user`;

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  error: null,

  signup: async (username, email, password, confirmPassword) =>{
    set({ isLoading: true, error: null});

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password, confirmPassword });

      set({ user: response.data.user, isAuthenticated: false, isLoading: false });
      return response;
    } catch (err) {
      set({ error: err.response.data.message || "Error signing up", isLoading: false });
      throw err;
    }
  },

  login: async (identifier, password) =>{
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { identifier, password });

      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (err) {
      console.log(err);
      set({ error: err.response.data.message || "Error loggin in", isLoading: false });
      throw err;
    }
  },

  verifyUser: async (verificationCode) =>{
    set({ isLoading: true, error: null });

    try {
      console.log(verificationCode);
      const response = await axios.post(`${API_BASE_URL}/verify`, { verificationCode });
      set({ user: response.data.user , isLoading: false });
      
      return response;
    } catch (err) {
      set({ error: err.response.data.message || "Error verifying user", isLoading: false });
      throw err;
    }
  },

  checkAuth: async () => {
    set({ isAuthenticated: false, isCheckingAuth: true, error: null });

    try {
      const response = await axios.get(`${API_BASE_URL}/check-auth`);

      set({ user: response.data.user, isCheckingAuth: false, isAuthenticated: true });
      return response;
    } catch (err) {
      console.log(err);
      set({ isCheckingAuth: false });
    }
  },

  setError: (err) =>{
    set({ error: err });
  },
}));