import { useEffect, useState } from "react";
import defaultUser from "../assets/defaultUser.png"
import { useAuthStore } from "../store/authStore";
import EmojiInput from "./EmojiInput";
import { useCommentStore } from "../store/commentStore";
import { LoaderCircle } from "lucide-react";

const CommentInput = ({ editMode=false, initialComment="", onSubmit, onCancelEdit }) => {
  const { user } = useAuthStore();
  const { posting, addComment } = useCommentStore();

  const [comment, setComment] = useState(initialComment);

  const handleCancel = () =>{
    if (editMode) onCancelEdit();
    else setComment("");
  }

  const handleSubmit = () =>{
    if (editMode) onSubmit(comment);
    else handleAdd();
  }

  const handleAdd = async () =>{
    await addComment(comment);
    setComment("");
  }

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect (() =>{
    const checkScreenSize = () =>{
      setIsSmallScreen(window.innerWidth <= 768);
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [])

  if (posting) return (
    <div className="w-full flex justify-center">
      <LoaderCircle className="size-9 animate-spin [animation-duration:.6s] text-gray-400" />
    </div>
  )
  
  return (
    <div className="flex gap-3">
      {!editMode && <div className="w-9 shrink-0">
        <img className="w-full bg-gray-300 rounded-full" src={user?.avatar || defaultUser} />
      </div>}

      <div className="w-full sm:w-98">
        <textarea 
          name="comment-input"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border-2 border-gray-500 w-full rounded-md py-1 px-2 font-semibold resize-none placeholder:font-semibold" 
          placeholder="Enter your comment.." 
        />

        <div className={`relative flex items-center ${!isSmallScreen ? "justify-between": "justify-end"}`}>
          {!isSmallScreen && <EmojiInput comment={comment} setComment={setComment} />}
          <div>
            <button
              onClick={handleCancel} 
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-white rounded-lg cursor-pointer bg mr-2 ${!comment.trim() && !editMode ? "bg-gray-400": "bg-gray-600"}`}
            >
              Cancel
            </button>
            <button
              disabled={comment === initialComment}
              onClick={handleSubmit} 
              className={`px-2 sm:px-3 py-0.5 sm:py-1 font-semibold text-white rounded-lg cursor-pointer 
              ${!comment.trim() || (editMode && comment.trim() === initialComment) ? "bg-gray-400": "bg-purple-700"}`}
            >
              {editMode ? "Save": "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CommentInput;