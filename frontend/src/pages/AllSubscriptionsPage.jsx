import { useEffect, useState } from "react";
import ChannelCard from "../components/ChannelCard";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import NoticeMessage from "../components/NoticeMessage";
import { List } from "lucide-react";

const AllSubscriptionsPage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() =>{
    (async () =>{
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/subscription`);

        console.log("subscriptions", data);
        setTotalSubscriptions(data.totalSubscribedChannels);
        setSubscriptions(data.subscribedChannels);
      } catch (error) {
        console.log(error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [])

  if (!isAuthenticated){
    return (
      <NoticeMessage 
        icon={List}
        title={"Please login to view your subscriptions."}
        description={"You need to be logged in to access this page."}
        btnText="Login"
        btnLink="/login"
      />
    )
  }

  if (isLoading) return <LoadingSpinner />

  console.log(subscriptions);

  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-22 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-42 pb-2">
      <h1 className="font-bold text-2xl sm:text-3xl pl-0.5 mb-2 sm:mb-4">All Subscriptions</h1>
      <div>
        {subscriptions.map((subscription) => (
          <ChannelCard 
            key={subscription._id}
            {...subscription}
          />
        ))}
      </div>
    </div>
  )
}
export default AllSubscriptionsPage;