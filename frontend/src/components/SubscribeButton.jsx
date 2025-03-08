import axios from "axios";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const SubscribeButton = ({ isSubscribed, setIsSubscribed, channelId }) => {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscription = async () =>{
    if (isLoading) return;

    if (!isAuthenticated){
      toast.error("Please Login to Subscribe");
      return;
    }
    
    setIsLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/subscription/c/${channelId}`);
      setIsSubscribed((isSubscribed) => !isSubscribed);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={() => handleSubscription()}
      disabled={isLoading}
      className={`px-4 py-2 rounded-3xl font-semibold ${isSubscribed ? "bg-white text-black": "bg-black text-white"} ${isLoading ? "opacity-60 cursor-not-allowed": "cursor-pointer"}`}>
      {!isSubscribed ? "Subscribe": "Unsubscribe"}
    </button>
  )
}
export default SubscribeButton;