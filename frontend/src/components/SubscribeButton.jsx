import axios from "axios";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useSubscriptionStore } from "../store/subscriptionStore";

const SubscribeButton = () => {
  const { isAuthenticated } = useAuthStore();
  const { isLoading, isSubscribed, handleSubscription } = useSubscriptionStore();

  const toggleSubscription = async () =>{
    if (isLoading) return;

    if (!isAuthenticated){
      toast.error("Please Login to Subscribe");
      return;
    }

    await handleSubscription();
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