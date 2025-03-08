import { Link } from "react-router-dom";
import { formatTime, timeAgo } from "../utils/date";
import { formattedViews as formatViews } from "../utils/number";

const HomeVideoCard = ({ _id, thumbnail, title, channelId, channelName, channelAvatar, duration, views, createdAt, showChannelInfo = true }) => {
  const formattedDuration = formatTime(duration);
  const uploadedTime = timeAgo(createdAt);
  const formattedViews = formatViews(views);

  return (
    <Link to={`/video/${_id}`}>
      <div className="rounded-md p-2 bg-gray-50 hover:bg-gray-200 transition-all duration-300 cursor-pointer">
        <div className="thumbnail relative mb-2">
          <img
            className="rounded-md"
            src={thumbnail}
          />

          <span className="absolute right-2 bottom-2 bg-black/55 text-white text-sm py-0.5 px-1 rounded-md">{formattedDuration}</span>
        </div>

        <div className="details flex w-full">
          { showChannelInfo && <div className="profile-img w-9 mr-2 shrink-0">
            <Link to={`/channel/${channelId}`}>
              <img
                className="w-full rounded-full"
                src={"https://yt3.ggpht.com/C25u3DcSguL-wd3GaO110Q1fyO5ClTraTjtF72kJhZtpQwuAv3zLmb7K-ZLJecQQJBVvP1McmA=s68-c-k-c0x00ffffff-no-rj"} // avatar
              />
            </Link>
          </div> }

          <div className="video-details font-semibold">
            <div className="title mb-2 leading-4.5">{title}</div>
            { showChannelInfo && <div className="channel-name text-sm text-gray-500 leading-none">
              <Link to={`/user/${channelId}`}>
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