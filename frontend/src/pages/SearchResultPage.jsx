import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { LoaderCircle } from "lucide-react";
import RowVideoCard from "../components/RowVideoCard";
import HomeVideoCard from "../components/HomeVideoCard";
import useSearchStore from "../store/searchStore";

const SearchResultPage = () => {
  const { query, setQuery } = useSearchStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [videoResults, setVideoResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const lastVideoRef = useInfiniteScroll({ loading, hasMore, setPage });

  const searchQuery = searchParams.get("search_query");

  useEffect(() =>{
    const checkScreenSize = () =>{
      if (window.innerWidth < 768) setIsSmallScreen(true);
      else setIsSmallScreen(false);
    }

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [])
  console.log(isSmallScreen);

  useEffect(() => {
    setVideoResults([]);
    setPage(0);
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    (async () =>{
      setLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search/results`, {
        params: {
          search_query: searchQuery,
          page: page,
        }
      });

      console.log(data);
      setVideoResults((prev) => [...prev, ...data.videoResults]);
      setHasMore(data.hasMore);
      setLoading(false);
    })()
  }, [searchQuery, page]);

  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-6 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-26 pb-2">
      <div className="px-4">
      {videoResults.map(({ _id, thumbnail, videoFile, title, description, channel, duration, views, createdAt }) =>(
          isSmallScreen ? (
            <HomeVideoCard 
              key={_id} 
              _id={_id} 
              thumbnail={thumbnail} 
              videoFile={videoFile}
              title={title} 
              description={description}
              channelId={channel._id} 
              channelName={channel.username} 
              channelAvatar={channel.avatar} 
              duration={duration} 
              views={views} 
              createdAt={createdAt}
            />
          ): (
            < RowVideoCard
            key={_id} 
            _id={_id} 
            thumbnail={thumbnail} 
            videoFile={videoFile}
            title={title} 
            description={description}
            channelId={channel._id} 
            channelName={channel.username} 
            channelAvatar={channel.avatar} 
            duration={duration} 
            views={views} 
            createdAt={createdAt}
          />
        )))}    
      </div>

      <div className="h-1" ref={lastVideoRef}></div>

      {/* {error && <div className="text-center text-red-500 mt-4">{error}</div>} */}

      { loading && <div className="flex justify-center mt-2">
          <LoaderCircle className="size-9 animate-spin [animation-duration:.6s]" />
        </div>
      }
    </div>
  )
}
export default SearchResultPage;