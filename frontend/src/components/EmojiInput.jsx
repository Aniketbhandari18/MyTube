import EmojiPicker from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const EmojiInput = ({ comment, setComment }) => {
  const [isOpen, setIsOpen] = useState(false);
  const emojiRef = useRef(null);

  useEffect(() =>{
    if (!isOpen) return;

    const handleClickOutside = (e) =>{      
      if (emojiRef.current && !emojiRef.current.contains(e.target)){
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen])

  return (
    <div ref={emojiRef}>
      <SmilePlus 
        onClick={() =>{setIsOpen(!isOpen)}}
        className="size-5 sm:size-6 cursor-pointer" 
      />
      <div className="absolute top-10 left-0">
        <EmojiPicker
          open={isOpen}
          emojiStyle="apple"
          onEmojiClick={(e) => setComment(comment + e.emoji)} 
        />
      </div>
    </div>
  )
}
export default EmojiInput;