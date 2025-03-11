import { Globe, X } from "lucide-react";
import { useState } from "react";

const DescriptionPopUp = ({ content, setIsExpanded }) =>{
  return (
    <div className="fixed z-50 top-0 left-0 right-0 bottom-0 flex justify-center items-center h-screen bg-black/25">
      <div className="bg-gray-100 rounded-lg p-5 max-w-110 max-h-200 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-black">About</h2>
          <button className="cursor-pointer text-black" onClick={() => setIsExpanded(false)}>
            <X className="size-6" />
          </button>
        </div>

        <div className="whitespace-pre-line mb-3">{content}</div>
      </div>
    </div>
  )
}

const Description = ({ content, maxLength, popUpMode=false }) => {
  if (!content) return null;
  const [isExpanded, setIsExpanded] = useState(false);

  const shortContent = (content.length > maxLength) ? content.slice(0, maxLength): content;

  return (
    <div 
      className="text-sm sm:text-sm md:text-[16px] font-semibold text-gray-600 mb-1 sm:mb-2"
    >
      { isExpanded && popUpMode && <div className="flex justify-between">
        <DescriptionPopUp content={content} setIsExpanded={setIsExpanded} />
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
export default Description;