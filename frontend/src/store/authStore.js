import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/user`;

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
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

  logout: async () =>{
    set({ isLoading: true, error: null });

    try {
      await axios.post(`${API_BASE_URL}/logout`);

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ error: error.response.data.message || "Error logging out", isLoading: false });
      throw error;
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
      try {
        const response = await axios.post(`${API_BASE_URL}/refresh-token`);

        set({ user: response.data.user, isCheckingAuth: false, isAuthenticated: true });
      } catch (err) {
        console.log(err);
        set({ isCheckingAuth: false });
      }

      set({ isCheckingAuth: false });
    }
  },

  editProfile: async (updatedData) =>{
    set({ isLoading: true });

    try {
      const response = await axios.patch(`${API_BASE_URL}/edit-profile`, updatedData);

      set({ user: response.data.user });
      toast.success("Profile updated successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile");
    } finally {
      set({ isLoading: false });
    }
  },

  editPassword: async (oldPassword, newPassword) =>{
    set({ isLoading: true });

    try {
      await axios.patch(`${API_BASE_URL}/edit-password`, { oldPassword, newPassword });
      toast.success("Password updated successfully");
    } catch (err) {
      console.log(err);
      toast.error(err.response.data.message || "Failed to update password");
    } finally {
      set({ isLoading: false });
    }
  },

  setError: (err) =>{
    set({ error: err });
  },
}));