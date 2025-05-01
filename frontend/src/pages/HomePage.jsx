import NavBar from "../components/NavBar"
import Sidebar from "../components/Sidebar"
import HomeVideoCard from "../components/HomeVideoCard";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const lastVideoRef = useInfiniteScroll(loading, hasMore, setPage);

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/video`;

  useEffect(() =>{
    if (!hasMore) return;
    setLoading(true);

    (async () =>{
      try {
        const response = await axios.get(`${API_BASE_URL}/homeVideos?page=${page}`);

        setVideos((prevVideos) => [...prevVideos, ...response.data.result]);
        setHasMore(response.data.hasMore);
      } catch (err) {
        console.log(err);
        setError("Error fetching videos");
      } finally {
        setLoading(false);
      }
    })();
  }, [page])

  console.log(videos.length);


  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-6 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-26 pb-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 sm:gap-2 lg:gap-4">
        {videos.map(({ _id, thumbnail, videoFile, title, owner, duration, views, createdAt }) =>(
          <HomeVideoCard 
            key={_id} 
            _id={_id} 
            thumbnail={thumbnail} 
            videoFile={videoFile}
            title={title} 
            channelId={owner._id} 
            channelName={owner.username} 
            channelAvatar={owner.avatar} 
            duration={duration} 
            views={views} 
            createdAt={createdAt}
          />
        ))}

      </div>

      <div className="h-1" ref={lastVideoRef}></div>

      {error && <div className="text-center text-red-500 mt-4">{error}</div>}

      { loading && <div className="flex justify-center mt-2">
          <LoaderCircle className="size-9 animate-spin [animation-duration:.6s]" />
        </div>
      }
    </div>
  )
}
export default HomePage