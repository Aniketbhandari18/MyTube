import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import RowVideoCard from "../components/RowVideoCard";
import { History, LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import NoticeMessage from "../components/NoticeMessage";

const WatchHistoryPage = () => {
  const { isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [watchHistory, setWatchHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const lastElementRef = useInfiniteScroll(isLoading, hasMore, setPage);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    (async () =>{
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/watchHistory?page=${page}`);

        console.log(data);
        setWatchHistory((prev) => [...prev, ...data.watchHistory]);
        setHasMore(data.hasMore);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [page])

  console.log("page:", page);

  const handleClearHistory = async () =>{
    try {
      setIsLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/watchHistory/clear`);
      console.log("Watch history cleared successfully");
      setWatchHistory([]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleRemoveVideo = async (watchHistoryId) =>{
    const prevWatchHistory = [...watchHistory];
    const newWatchHistory = watchHistory.filter(({ _id }) => _id !== watchHistoryId);
    setWatchHistory(newWatchHistory);

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/watchHistory/remove/${watchHistoryId}`);
    } catch (error) {
      console.log(error);
      setWatchHistory(prevWatchHistory);
      toast.error("Failed to remove video from watch history. Please try again.");
    }
  }

  console.log(watchHistory);

  if (!isAuthenticated) return (
    <NoticeMessage
      icon={History}
      title={"Please login to view your watch history."}
      description={"You need to be logged in to access this page."}
      btnText="Login"
      btnLink="/login"
    />
  )

  if (watchHistory.length === 0 && !isLoading) return (
    <NoticeMessage 
      icon={History}
      title={"No watch history yet."}
      description={"Looks like you haven’t watched anything yet. Start exploring and your watch history will show up here."}
      btnText="Browse Videos"
      btnLink="/"
    />
  )

  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-6 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-26 pb-2">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-2xl sm:text-3xl pl-1">Watch History</h1>
        {watchHistory.length > 0 && <button 
          onClick={handleClearHistory} 
          className="text-red-500 border border-red-500 hover:bg-red-500 hover:text-white font-medium py-1 px-3 rounded-md text-sm sm:text-base transition-colors duration-200 cursor-pointer"
        >
          Clear All
        </button>}
      </div>

      <div>
        {watchHistory.map(({ video, _id }) => (
          <RowVideoCard 
            key={_id}
            _id={video._id}
            thumbnail={video.thumbnail}
            videoFile={video.videoFile}
            title={video.title}
            description={video.description}
            channelId={video.owner._id}
            channelName={video.owner.username}
            channelAvatar={video.owner.avatar}
            duration={video.duration}
            views={video.views}
            createdAt={video.createdAt}
            onRemove={() => handleRemoveVideo(_id)}
          />
        ))}
      </div>

      <div className="h-1" ref={lastElementRef}></div>

      { isLoading && <div className="flex justify-center mt-2">
          <LoaderCircle className="size-9 animate-spin [animation-duration:.6s]" />
        </div>
      }
    </div>
  )
}
export default WatchHistoryPage;