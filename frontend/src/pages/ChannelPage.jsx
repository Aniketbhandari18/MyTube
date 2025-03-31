import defaultUser from "../assets/defaultUser.png";
import noResult from "../assets/no-result.png"
import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import HomeVideoCard from "../components/HomeVideoCard";
import SubscribeButton from "../components/SubscribeButton";
import NotFoundPage from "./NotFoundPage";
import { useSubscriptionStore } from "../store/subscriptionStore";
import ContentBox from "../components/ContentBox";

const ChannelDesc = ({ isOwner, description }) =>{
  console.log(description)
  return (
    <>
      <div className="mb-1 sm:mb-3">
        <ContentBox content={description} maxLength={60} popUpMode={true} />
      </div>

      { !isOwner ? (<SubscribeButton />): (
        <Link to={"/channel/edit" }>
          <button className="text-sm sm:text-sm px-4 py-2 bg-black text-white rounded-3xl font-semibold cursor-pointer">
            Customize Profile
          </button>
        </Link>
      ) }
    </>
  );
  
}

const ChannelPage = () => {
  const { user } = useAuthStore();
  const { initializeSubscription } = useSubscriptionStore();
  const { channelIdentifier } = useParams();

  const [channel, setChannel] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() =>{
    (async () =>{
      try {
        setIsLoading(true);

        const channelResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/${channelIdentifier}`);
        console.log("channelIdentifier:", channelIdentifier);
        console.log("userId:", channelResponse.data.user._id);
        setChannel(channelResponse.data.user);
        initializeSubscription(channelResponse.data.user.isSubscribed, channelResponse.data.user._id);
        console.log(channelResponse.data.user.isSubscribed);
        setIsOwner(channelResponse.data.user._id === user?._id);


        const videoResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/video/channel/${channelResponse.data.user._id}`);
        console.log("videoResponse:", videoResponse);

        setVideos(videoResponse.data.videos);
      } catch (err) {
        console.log(err);
        setError(err.response.data.message);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [channelIdentifier, user?._id])

  if (isLoading) return <LoadingSpinner />

  if (error) return <NotFoundPage />

  return (
    <div className="min-h-screen bg-gray-50 pr-3 xs:pr-4.5 sm:pr-11 pt-22 sm:pt-24 pl-7.5 xs:pl-20 sm:pl-30 pb-2">
      <NavBar />
      <Sidebar />

      <div className="mb-4">
        {/* coverImage */}
        { channel.coverImage && (
          <div className="cover-image w-full rounded-xl overflow-hidden mb-4 aspect-[4/1] sm:aspect-[6/1]">
            <img 
              className="w-full h-full object-cover" 
              src={channel.coverImage} 
            />
          </div>
        )}

        {/* channelInfo */}
        <div className="flex gap-2 sm:gap-4">
          <div className="rounded-full overflow-hidden w-20 sm:w-26 md:w-35">
            { channel.avatar ? (
              <img className="rounded-full" src={channel.avatar} />
              ): (
                <img className="bg-gray-300 rounded-full" src={defaultUser} />
              ) }
          </div>
          <div className="channel-details">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold md:mb-2">{channel.username}</h1>
            <p className="text-sm md:text-[16px] text-gray-600">{channel.subscriberCount} subscribers &#8226; {videos.length} videos</p>
            <div className="hidden sm:block">
              <ChannelDesc isOwner={isOwner} description={channel.description} />
            </div>
          </div>
        </div>

          <div className="sm:hidden mt-2 ml-2">
            <ChannelDesc isOwner={isOwner} description={channel.description} />
          </div>
      </div>

      <div>
        <div className="w-full h-px bg-gray-300 mb-4"></div>

        { videos.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            { videos.map(({ _id, thumbnail, title, duration, views, createdAt }) =>(
              <HomeVideoCard 
                key={_id} 
                _id={_id} 
                thumbnail={thumbnail} 
                title={title} 
                channelId={channel._id} 
                channelName={channel.username} 
                channelAvatar={channel.avatar} 
                duration={duration} 
                views={views} 
                createdAt={createdAt}
                showChannelInfo={false}
              />
            )) }
          </div>
        ): (
          <div className="flex items-center flex-col">
            <div>
              <img className="w-90 rounded-full" src={noResult} />
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
              No Videos found
            </div>
          </div>
        ) }
      </div>
    </div>
  )
}
export default ChannelPage;