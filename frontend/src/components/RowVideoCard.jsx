import defaultUser from "../assets/defaultUser.png"
import { Link } from "react-router-dom";
import { formatTime, timeAgo } from "../utils/date";
import { formattedCount } from "../utils/number";
import { useEffect, useRef, useState } from "react";

const RowVideoCard = ({ _id, thumbnail, videoFile, title, description, channelId, channelName, channelAvatar, duration, views, createdAt }) => {
  const formattedDuration = formatTime(duration);
  const uploadedTime = timeAgo(createdAt);
  const formattedViews = formattedCount(views);

  const [maxLength, setMaxLength] = useState(250);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef(null);

  const formattedDescription = description.length > maxLength ? description.slice(0, maxLength) + "..." : description;

  useEffect(() =>{
    const updateMaxLength = () =>{
      if (window.innerWidth < 300) setMaxLength(50)
      else if (window.innerWidth < 400) setMaxLength(80);
      else if (window.innerWidth < 560) setMaxLength(100);
      else if (window.innerWidth < 768) setMaxLength(40);
      else if (window.innerWidth < 960) setMaxLength(80);
      else setMaxLength(250);
    }

    updateMaxLength();

    window.addEventListener("resize", updateMaxLength);

    return () => window.removeEventListener("resize", updateMaxLength);
  }, [])

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
      <div className="rounded-md p-2 bg-gray-50 hover:bg-gray-200 transition-all duration-300 cursor-pointerf flex gap-3 sm:gap-5">
        <div 
          className="thumbnail relative mb-2 aspect-video shrink-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}  
        >
          <img
            className={`w-[150px] xs:w-[180px] sm:w-[35vw] md:w-[35vw] rounded-md aspect-video object-cover bg-gray-200 duration-300
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

        <div className="details flex flex-col w-full">
          {/* title and view and time */}
          <div className="video-details font-semibold mb-1 sm:mb-2 sm:text-base text-sm">
            <div className="title leading-3.5 sm:leading-4.5 line-clamp-2">{title}</div>
            <div className="views text-sm text-gray-500">
              <span>{formattedViews} views</span>
              <span className="sm:inline hidden"> &#8226; {uploadedTime}</span>
            </div>
          </div>
          
          {/* username and avatar */}
          <div className="profile-img flex items-center gap-2 mb-0 sm:mb-2">
            <Link to={`/channel/${channelId}`} className="w-6 xs:w-7 sm:w-8 shrink-0 hidden xs:block">
              { channelAvatar ? (<img
                className="w-full rounded-full"
                src={channelAvatar} // avatar
              />): (
                <img className="w-full bg-gray-300 rounded-full" src={defaultUser} />
              ) }
            </Link>
            <div className="text-md font-semibold text-gray-500 leading-none sm:text-base text-sm break-all line-clamp-1">
              <Link to={`/channel/${channelId}`}>
                {channelName}
              </Link>
            </div>
          </div>

          {/* description */}
          <div className="description text-sm text-gray-600 hidden sm:block">
            {formattedDescription}
          </div>
        </div>
      </div>
    </Link>
  )
}
export default RowVideoCard;