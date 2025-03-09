import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useSubscriptionStore = create((set, get) => ({
  isSubscribed: false,
  isLoading: false,
  channelId: null,

  handleSubscription: async () =>{
    set({ isLoading: true });
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/subscription/c/${get().channelId}`);
      
      set((state) => ({ isSubscribed: !state.isSubscribed }))
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong..")
    } finally {
      set({ isLoading: false });
    }
  },

  initializeSubscription: (state, id) =>{
    set({ isSubscribed: state, channelId: id })
  }
}))