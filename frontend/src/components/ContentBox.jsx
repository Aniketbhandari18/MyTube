import { useState } from "react";
import AboutPopUp from "./AboutPopUp";

const ContentBox = ({ content, maxLength, popUpMode=false }) => {
  if (!content) return null;
  const [isExpanded, setIsExpanded] = useState(false);

  const shortContent = (content.length > maxLength) ? content.slice(0, maxLength): content;

  return (
    <div 
      className="text-sm sm:text-sm md:text-[16px] font-semibold text-gray-600 mb-1 sm:mb-2"
    >
      { isExpanded && popUpMode && <div className="flex justify-between">
        <AboutPopUp content={content} setIsExpanded={setIsExpanded} />
      </div> }

      <div>
        { isExpanded && !popUpMode ? content: shortContent }
        { !popUpMode ? (
            content.length > maxLength && <button className="text-black ml-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
              { !isExpanded ? "...more": "...less" }
            </button>
          ): (
            content.length > maxLength && <button className="text-black ml-1 cursor-pointer" onClick={() => setIsExpanded(true)}>
              ...more
            </button>
          ) }
      </div>
    </div>
  )
}
export default ContentBox;