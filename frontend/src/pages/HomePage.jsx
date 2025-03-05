import NavBar from "../components/NavBar"
import Sidebar from "../components/Sidebar"
import HomeVideoCard from "../components/HomeVideoCard";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { LoaderCircle } from "lucide-react";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observerRef = useRef(null);

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

  useEffect(() =>{
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver((entries) =>{
      if (entries[0].isIntersecting){
        console.log("hit bottom");
        setPage((prevPage) => prevPage + 1); // This will load more videos due to useEffect above
      }
    }, {threshold: 0.5});

    if (observerRef.current){
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading])
  
  console.log(videos.length);


  return (
    <div className="min-h-screen bg-gray-50 pr-4 pt-24 pl-18 sm:pl-28 pb-2">
      <NavBar />
      <Sidebar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {videos.map(({ _id, thumbnail, title, owner, duration, views, createdAt }) =>(
          <HomeVideoCard 
            key={_id} 
            _id={_id} 
            thumbnail={thumbnail} 
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

      <div className="h-1" ref={observerRef}></div>

      {error && <div className="text-center text-red-500 mt-4">{error}</div>}

      { loading && <div className="flex justify-center mt-2">
          <LoaderCircle className="size-9 animate-spin [animation-duration:.6s]" />
        </div>
      }
    </div>
  )
}
export default HomePage