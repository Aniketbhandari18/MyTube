import defaultUser from "../assets/defaultUser.png";
import { Link } from "react-router-dom";
import SubscribeButton from "./SubscribeButton";
import { useEffect, useState } from "react";

const ChannelCard = ({ _id, username, description, avatar, subscriberCount }) => {
  const [maxLength, setMaxLength] = useState(250);
  
    const formattedDescription = description.length > maxLength ? description.slice(0, maxLength).trim() + "..." : description;
  
    useEffect(() =>{
      const updateMaxLength = () =>{
        if (window.innerWidth < 560) setMaxLength(30);
        else if (window.innerWidth < 768) setMaxLength(50);
        else if (window.innerWidth < 960) setMaxLength(150);
        else setMaxLength(250);
      }
  
      updateMaxLength();
  
      window.addEventListener("resize", updateMaxLength);
  
      return () => window.removeEventListener("resize", updateMaxLength);
    }, [])

  return (
    <div className="flex items-center justify-between w-full gap-3 xs:gap-4 py-2 xs:py-4 border-b border-gray-200">
      {/* Avatar */}
      <Link to={`/channel/${_id}`}>
        <img
          src={avatar || defaultUser}
          alt={username}
          className="w-15 sm:w-20 rounded-full object-cover bg-gray-200"
        />
      </Link>

      {/* Channel Info */}
      <div className="flex-1">
        <Link to={`/channel/${_id}`}>
          <h2 className="font-semibold text-sm sm:text-lg leading-5">
            {username}
          </h2>
        </Link>
        <p className="text-sm text-gray-500 mb-1 font-semibold">
          {subscriberCount || 0} subscribers
        </p>
        <p className="text-sm text-gray-700 block">
          {formattedDescription || "No description available."}
        </p>
      </div>

      {/* Subscribe/Unsubscribe Button */}
      <SubscribeButton 
        initialSubscription={true} 
        channelId={_id} 
        className="!px-2 !py-1 sm:!px-4 sm:!py-2 !text-sm sm:!text-[16px]" 
      />
    </div>
  );
};

export default ChannelCard;
