import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/user`;

axios.defaults.withCredentials = true;

export const userAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: false,
  error: null,
  message: null,

  signup: async (username, email, password, confirmPassword) =>{
    set({ isLoading: true, error:  null});

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { username, email, password, confirmPassword });

      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err.response.data.message || "Error signing up", isLoading: false });
      throw err;
    }
  },

  login: async (identifier) =>{
    set({ isLoading: true, error: null });

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { identifier });

      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ error: err.response.data.message || "Error loggin in", isLoading: false });
    }
  },

  verifyUser: async () =>{
    
  }
}));