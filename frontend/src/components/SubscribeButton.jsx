import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useState } from "react";

const SubscribeButton = ({ initialSubscription, channelId }) => {
  const { isAuthenticated } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(initialSubscription);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSubscription = async () =>{
    if (isLoading) return;

    if (!isAuthenticated){
      toast.error("Please Login to Subscribe");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/subscription/c/${channelId}`);
      
      setIsSubscribed((prev) => !prev);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong..")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={() => toggleSubscription()}
      disabled={isLoading}
      className={`px-4 py-2 rounded-3xl font-semibold 
        ${isSubscribed ? "bg-gray-300 text-black": "bg-black text-white"} 
        ${isLoading ? "opacity-60 cursor-not-allowed": "cursor-pointer"}`
      }
    >
      {!isSubscribed ? "Subscribe": "Unsubscribe"}
    </button>
  )
}
export default SubscribeButton;