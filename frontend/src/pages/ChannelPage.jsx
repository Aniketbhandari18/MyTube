import { useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import HomeVideoCard from "../components/HomeVideoCard";

const ChannelDesc = ({ isOwner, description }) =>{
  return (
    <>
      <p className="text-sm sm:text-sm md:text-[16px] font-semibold text-gray-600 mb-1 sm:mb-2">{description}</p>

      {
        !isOwner ? <button className="px-4 py-2 bg-black text-white rounded-3xl font-semibold cursor-pointer">
          Subscribe
        </button>:
        <button className="text-sm sm:text-sm px-4 py-2 bg-black text-white rounded-3xl font-semibold cursor-pointer">
          Customize Profile
        </button>
      }
    </>
  );
  
}

const ChannelPage = () => {
  const { user } = useAuthStore();
  const { channelIdentifier } = useParams();

  const [channel, setChannel] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [vidoes, setVideos] = useState([]);
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

        if (channelResponse.data.user._id === user._id){
          setIsOwner(true);
        }


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
  }, [])

  if (isLoading) return <LoadingSpinner />

  if (error) return <div>{error}</div>

  return (
    <div className="min-h-screen bg-gray-50 pr-4.5 sm:pr-11 pt-24 pl-20 sm:pl-30 pb-2">
      <NavBar />
      <Sidebar />

      <div className="mb-4">
        {/* coverImage */}
        { channel.coverImage && <div className="cover-image rounded-xl overflow-hidden mb-4">
          { true && <img className="w-full" src={"https://yt3.googleusercontent.com/hBFuxix2oeAw9twotBd8C6sZw3M9kSOPYBhrHisGMlKp0RYLVMR6Jkdm_q-9L_Z6eaPrj6LlQA=w1138-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj"} /> }
        </div>}

        {/* channelInfo */}
        <div className="flex gap-2 sm:gap-4">
          <div className="rounded-full overflow-hidden w-20 sm:w-26 md:w-35">
            <img className="rounded-full" src={channel.avatar} />
          </div>
          <div className="channel-details">
            <h1 className="text-xl sm:text-2xl md:text-4xl font-bold md:mb-2">{channel.username}</h1>
            <p className="text-sm md:text-[16px] text-gray-600">{channel.subscriberCount} subscribers &#8226; {vidoes.length} videos</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          { vidoes.map(({ _id, thumbnail, title, owner, duration, views, createdAt }) =>(
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
      </div>
    </div>
  )
}
export default ChannelPage;