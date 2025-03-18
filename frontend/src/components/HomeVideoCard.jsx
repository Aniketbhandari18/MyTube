import defaultUser from "../assets/defaultUser.png"
import { Link } from "react-router-dom";
import { formatTime, timeAgo } from "../utils/date";
import { formattedCount } from "../utils/number";
import { useRef, useState } from "react";

const HomeVideoCard = ({ _id, thumbnail, videoFile, title, channelId, channelName, channelAvatar, duration, views, createdAt, showChannelInfo = true }) => {
  const formattedDuration = formatTime(duration);
  const uploadedTime = timeAgo(createdAt);
  const formattedViews = formattedCount(views);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const handleMouseEnter = () =>{
    hoverTimeout.current = setTimeout(() =>{
      setIsHovered(true);
    }, 500)
  }
  const handleMouseLeave = (e) =>{
    clearTimeout(hoverTimeout.current);
    setIsHovered(false);
  }


  return (
    <Link to={`/watch/${_id}`}>
      <div className="rounded-md p-2 bg-gray-50 hover:bg-gray-200 transition-all duration-300 cursor-pointer">
        <div 
          className="thumbnail relative mb-2 aspect-video"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}  
        >
          <img
            className={`rounded-md aspect-video object-cover bg-gray-200 duration-300
              ${!isHovered ? "opacity-100": "opacity-0"}`}
            src={thumbnail}
          />

          <video 
            className={`rounded-md absolute top-0 left-0 w-full h-full object-cover aspect-video bg-gray-200 duration-300 ${isHovered ? "opacity-100": "opacity-0"}`}
            src={videoFile}
            muted
            loop
            autoPlay
          />

          <span className="absolute right-2 bottom-2 bg-black/55 text-white text-sm py-0.5 px-1 rounded-md">{formattedDuration}</span>
        </div>

        <div className="details flex w-full">
          { showChannelInfo && <div className="profile-img w-9 mr-2 shrink-0">
            <Link to={`/channel/${channelId}`}>
              { channelAvatar ? (<img
                className="w-full rounded-full"
                src={channelAvatar} // avatar
              />): (
                <img className="w-full bg-gray-300 rounded-full" src={defaultUser} />
              ) }
            </Link>
          </div> }

          <div className="video-details font-semibold">
            <div className="title mb-2 leading-4.5">{title}</div>
            { showChannelInfo && <div className="channel-name text-sm text-gray-500 leading-none">
              <Link to={`/channel/${channelId}`}>
                {channelName}
              </Link>
            </div> }
            <div className="views text-sm text-gray-500">
              {formattedViews} views &#8226; {uploadedTime}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
export default HomeVideoCard;