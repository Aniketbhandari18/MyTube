import { LoaderCircle, ThumbsUp } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import NoticeMessage from "../components/NoticeMessage";
import RowVideoCard from "../components/RowVideoCard";
import axios from "axios";
import toast from "react-hot-toast";

const LikedVideosPage = () => {
  const { isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [likedVideos, setLikedVideos] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const lastElementRef = useInfiniteScroll(isLoading, hasMore, setPage);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    (async () =>{
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/engagement?page=${page}`);

        console.log("data:", data);
        setLikedVideos((prev) => [...prev, ...data.likedVideos]);
        setHasMore(data.hasMore);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [page])

  console.log("page:", page);

  const handleRemoveVideo = async (engagementId, likedVideoId) =>{
    const prevLikedVideos = [...likedVideos];
    const newLikedVideos = likedVideos.filter(({ _id }) => _id !== engagementId);
    setLikedVideos(newLikedVideos);

    try {
      await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_BASE_URL}/engagement/handleEngagement/${likedVideoId}`,
        data: {
          action: "like"
        }
      })
    } catch (error) {
      console.log(error);
      setLikedVideos(prevLikedVideos);
      toast.error("Failed to remove video from liked videos. Please try again.");
    }
  }

  console.log(likedVideos);

  if (!isAuthenticated) return (
    <NoticeMessage
      icon={ThumbsUp}
      title={"Please login to view your liked videos."}
      description={"You need to be logged in to access this page."}
      btnText="Login"
      btnLink="/login"
    />
  )

  if (likedVideos.length === 0 && !isLoading) return (
    <NoticeMessage 
      icon={ThumbsUp}
      title={"No liked videos yet."}
      description={"Looks like you haven’t liked anything yet. Start exploring and your liked videos will show up here."}
      btnText="Browse Videos"
      btnLink="/"
    />
  )

  return (
    <div className="min-h-screen bg-gray-50 pr-3 md:pr-6 pt-21 xs:pt-24 pl-7 xs:pl-18 sm:pl-23 md:pl-26 pb-2">
      <h1 className="font-bold text-2xl sm:text-3xl pl-1 mb-4">Liked Videos</h1>

      <div>
        {likedVideos.map(({ video, _id }) => (
          video && <RowVideoCard 
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
            onRemove={() => handleRemoveVideo(_id, video._id)}
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
export default LikedVideosPage;