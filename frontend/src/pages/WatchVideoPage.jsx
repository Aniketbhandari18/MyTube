import { Link, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { formattedCount } from "../utils/number";
import SubscribeButton from "../components/SubscribeButton";
import { useSubscriptionStore } from "../store/subscriptionStore";
import { useAuthStore } from "../store/authStore";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import NotFoundPage from "./NotFoundPage";
import toast from "react-hot-toast";
import ContentBox from "../components/ContentBox";
import CommentList from "../components/CommentList";
import CommentInput from "../components/CommentInput";
import { useCommentStore } from "../store/commentStore";

const Engagement = ({ videoId, engagement, setEngagement }) =>{
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleEngagement = async (action) =>{
    if (!isAuthenticated){
      toast.error("Please Login to Like/Dislike");
      return;
    }
    
    const userEngagement = engagement.engagement;
    const likesCount = engagement.likesCount;
    const dislikesCount = engagement.dislikesCount;

    const previousEngagement = engagement;
    let newEngagement;

    if (action === "like"){
      if (!userEngagement){
        newEngagement = { ...engagement, likesCount: formattedCount(likesCount + 1), engagement: action };
      }
      else if (userEngagement === "like"){
        newEngagement = { ...engagement, likesCount: formattedCount(likesCount - 1), engagement: null };
      }
      else if (userEngagement === "dislike"){
        newEngagement = { likesCount: formattedCount(likesCount + 1), dislikesCount: formattedCount(dislikesCount - 1), engagement: action };
      }
    }

    else{
      if (!userEngagement){
        newEngagement = { ...engagement, dislikesCount: formattedCount(dislikesCount + 1), engagement: action };
      }
      else if (userEngagement === "like"){
        newEngagement = { likesCount: formattedCount(likesCount - 1), dislikesCount: formattedCount(dislikesCount + 1), engagement: action };
      }
      else if (userEngagement === "dislike"){
        newEngagement = { ...engagement, dislikesCount: formattedCount(dislikesCount - 1), engagement: null };
      }
    }

    setEngagement(newEngagement);

    try {
      setIsLoading(true);

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/engagement/handleEngagement/${videoId}`, { action });
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong..");
      setEngagement(previousEngagement);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="flex gap-2 sm:gap-4">
      <div className="flex flex-col items-center">
        <motion.button
          disabled={isLoading}
          onClick={() => handleEngagement("like")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: .9 }}
          className={`flex items-center justify-center bg-gray-200 size-9 sm:size-10 p-2 rounded-full ${isLoading ? "cursor-not-allowed": "cursor-pointer"}`}
        >
          <ThumbsUp
            fill={engagement.engagement === "like" ? "black": "none"}
            strokeWidth={engagement.engagement === "like" ? 0: 2}
          />
        </motion.button>
        <p className="text-sm sm:text-md font-semibold text-gray-600">{engagement.likesCount}</p>
      </div>
      <div className="flex flex-col items-center">
        <motion.button
          disabled={isLoading}
          onClick={() => handleEngagement("dislike")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: .9 }}
          className={`flex items-center justify-center bg-gray-200 size-9 sm:size-10 p-2 rounded-full ${isLoading ? "cursor-not-allowed": "cursor-pointer"}`}>
          <ThumbsDown
            fill={engagement.engagement === "dislike" ? "black": "none"}
            strokeWidth={engagement.engagement === "dislike" ? 0: 2}
          />
        </motion.button>
        <p className="text-sm sm:text-md font-semibold text-gray-600">{engagement.dislikesCount}</p>
      </div>
    </div>
  )
}

const WatchVideoPage = () => {
  const { user } = useAuthStore();
  const { initializeSubscription } = useSubscriptionStore();
  const { setVideoId, totalComments, fetchComments } = useCommentStore();
  const { videoId } = useParams();

  const [video, setVideo] = useState({});
  const [channel, setChannel] = useState({});
  const [engagement, setEngagement] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [maxLength, setMaxLength] = useState(320);

  useEffect(() =>{
    const updateMaxLength = () =>{
      if (window.innerWidth < 300) setMaxLength(50)
      else if (window.innerWidth < 400) setMaxLength(80);
      else if (window.innerWidth < 560) setMaxLength(100);
      else if (window.innerWidth < 768) setMaxLength(120);
      else if (window.innerWidth < 960) setMaxLength(200);
      else setMaxLength(300);
    }

    updateMaxLength();

    window.addEventListener("resize", updateMaxLength);

    return () => window.removeEventListener("resize", updateMaxLength);
  }, [])

  useEffect(() =>{
    (async () =>{
      setIsLoading(true);

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/video/${videoId}`);

        console.log(data)

        setVideo(data.video);
        setVideoId(data.video._id);
        setChannel(data.channel);
        setIsOwner(data.channel._id === user?._id);
        initializeSubscription(data.channel.isSubscribed, data.channel._id);
        setEngagement(data.engagement);
      } catch (err) {
        console.log(err);
        setError(err.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [videoId, user?._id])

  useEffect(() =>{
    if (!video._id) return;

    (async () =>{
      await fetchComments();
    })()
  }, [video._id])


  const formattedSubscriberCount = formattedCount(channel.subscriberCount);
  const formattedViews = formattedCount(video.views);
  
  if (isLoading) return <LoadingSpinner />

  if (error){
    toast.error(error);
    return <NotFoundPage />
  }

  return (
    <div className="min-h-screen bg-gray-50 pr-4.5 sm:pr-11 md:pr-16 pt-22 sm:pt-26 pl-20 sm:pl-30 md:pl-35 pb-2">
      <NavBar />
      <Sidebar />

      <div>
        {/* video section */}
        <div>
          {/* video */}
          <div className="aspect-video mb-1 sm:mb-2 shadow-xl">
            <video
              className="rounded-xl w-full h-full bg-black/70"
              controls
              autoPlay
              src={video.videoFile}
            />
          </div>

          {/* video title */}
          <h1 className="sm:mb-0 md:mb-1 text-md sm:text-xl font-semibold md:text-2xl md:font-bold leading-5">
            {video.title}
          </h1>

          {/* views and uploded time */}
          <div className="mb-1">
            <span className="text-sm sm:text-md md:text-[16px] text-gray-600 mr-3 font-semibold">
              {formattedViews} views
            </span>
            <span className="text-sm sm:text-md md:text-[16px] text-gray-600 font-semibold">
              8 hours ago
            </span>
          </div>

          {/* channel and video info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* channel avatar */}
              <Link to={`/channel/${channel._id}`} className="w-8 sm:w-10 mr-2">
                <img className="w-full rounded-full" src={channel.avatar} />
              </Link>

              {/* name and subs */}
              <div className="mr-3">
                <Link to={`/channel/${channel._id}`} className="text-md sm:text-lg font-semibold">{channel.username}</Link>
                <p className="text-sm sm:text-md text-gray-600 font-semibold">{formattedSubscriberCount} subscribers</p>
              </div>

              { !isOwner && <div className="xs:block hidden">
                <SubscribeButton />
              </div> }
              
            </div>

            {/* engagement */}
            <div className="xs:block hidden">
              <Engagement videoId={video._id} engagement={engagement} setEngagement={setEngagement} />
            </div>
          </div>

          {/* engagement-xs */}
          <div className="flex justify-between items-center xs:hidden">
            <SubscribeButton />
            <Engagement videoId={video._id} engagement={engagement} setEngagement={setEngagement} />
          </div>

          {/* description */}
          <div className="bg-gray-200 rounded-lg mt-3 p-3">
            <ContentBox content={video.description} maxLength={maxLength} />
          </div>
        </div>

        <h2 className="text-lg sm:text-2xl font-bold mt-3 md:mt-6 mb-3">{totalComments} Comments</h2>

        <CommentInput />

        <CommentList maxLength={maxLength} />
      </div>
    </div>
  )
}
export default WatchVideoPage;