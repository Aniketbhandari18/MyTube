import { EllipsisVertical, SquarePen, Trash2 } from "lucide-react";
import defaultUser from "../assets/defaultUser.png"
import { useAuthStore } from "../store/authStore";
import ContentBox from "./ContentBox";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import CommentInput from "./CommentInput";

const CommentList = ({ comments, setComments, hasMore, maxLength }) => {
  if (!comments || comments.length === 0){
    return (
      <p className="text-lg font-semibold">No comments yet..</p>
    )
  }

  const { user } = useAuthStore();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);

  const menuRef = useRef();

  const handleMenuToggle = (commentId) =>{
    setOpenMenuId(openMenuId === commentId ? null: commentId);
  }

  const toggleEditingCommentId = (commentId) =>{
    setEditingCommentId(editingCommentId === commentId ? null: commentId);
  }

  useEffect(() =>{
    const handleClickOutside = (event) =>{
      if (menuRef.current && !menuRef.current.contains(event.target)){
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  const deleteComment = async (commentId) =>{
    try {
      const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/comment/${commentId}`);
  
      console.log(data.deletedComment);
  
      setComments((prev) =>
        prev.filter(({ _id }) => _id !== commentId)
      )
      toast.success("Comment deleted successfully")
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message);
    }
  }

  const onCancelEdit = () =>{
    setEditingCommentId(null);
    setOpenMenuId(null);
  }

  const editComment = async (commentId, editedContent) =>{
    if (!editedContent.trim()) return;

    try {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/comment/${commentId}`, { editedContent });

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? {...comment, content: data.editedComment.content}: comment
        )
      )

      toast.success("Comment edited successfully");
      setEditingCommentId(null);
      setOpenMenuId(null);
    } catch (err) {
      console.log(err);
      toast.error("Failed to edit comment");
    }
  }

  return (
    <div className="mt-8">
      { comments.map((comment) =>(
        <div key={comment._id} className="flex items-start mb-4">
          <Link to={`/channel/${comment.user._id}`} className="mr-2 w-7 shrink-0">
            <img 
              className="w-full rounded-full bg-gray-300"
              src={comment.user.avatar ? comment.user.avatar: defaultUser} 
            />
          </Link>
          <div className="flex flex-col justify-start">
            <Link
              to={`/channel/${comment.user._id}`}
              className="font-semibold text-gray-800 -mt-[6px]"
            >
              {comment.user.username}
            </Link>

            {editingCommentId === comment._id ? (
              <CommentInput editMode={true} initialComment={comment.content} onSubmit={(editedComment) => editComment(comment._id, editedComment)} onCancelEdit={onCancelEdit} />
            ): (
              <div 
              className={`bg-gray-200 rounded-lg py-2 px-3 ${user?._id === comment.user._id && "flex items-start"}`}>
                <ContentBox content={comment.content} maxLength={maxLength} />

                { user?._id === comment.user._id && (
                  <div className="relative flex items-center">
                    <button 
                      className="ml-3 mt-0.5 cursor-pointer"
                      onClick={() => handleMenuToggle(comment._id)}
                    >
                      <EllipsisVertical className="size-5" />

                      {/* <div className="relative mt-1">
                        <EllipsisVertical className="size-5" />

                        <div className="absolute right-3 border-2 py-2 px-3 bg-white rounded-lg">
                          <div className="flex gap-2 items-center">
                            <Trash2 className="size-5" />
                            <span className="font-semibold">delete</span>
                          </div>
                          <div className="h-[1.3px] bg-gray-400 shadow-2xl mt-1" />
                        </div>
                      </div> */}
                    </button>
                    {openMenuId === comment._id && (
                      <div
                        ref={menuRef} 
                        className="absolute top-7 right-3 border-2 py-2 px-3 bg-white rounded-lg"
                      >
                        <button 
                          onClick={() => deleteComment(comment._id)}
                          className="flex gap-2 items-center cursor-pointer"
                        >
                          <Trash2 className="size-5" />
                          <span className="font-semibold">delete</span>
                        </button>

                        <div className="h-[1.3px] bg-gray-400 shadow-2xl mt-2 mb-2" />

                        <button
                          onClick={() => toggleEditingCommentId(comment._id)} 
                          className="flex gap-2 items-center cursor-pointer"
                        >
                          <SquarePen className="size-5" />
                          <span className="font-semibold">edit</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )) }
    </div>
  )
}
export default CommentList;