import { ChevronsDown, EllipsisVertical, LoaderCircle, SquarePen, Trash2 } from "lucide-react";
import defaultUser from "../assets/defaultUser.png"
import { useAuthStore } from "../store/authStore";
import ContentBox from "./ContentBox";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import CommentInput from "./CommentInput";
import { useCommentStore } from "../store/commentStore";

const CommentList = ({ maxLength }) => {
  const { user } = useAuthStore();
  const { isLoading, comments, hasMore, fetchComments, deleteComment, editComment } = useCommentStore();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

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

  const handleDelete = async (commentId) =>{
    setDeletingCommentId(commentId)
    await deleteComment(commentId);
  }

  const onCancelEdit = () =>{
    setEditingCommentId(null);
    setOpenMenuId(null);
  }

  const handleEdit = async (commentId, editedContent) =>{
    await editComment(commentId, editedContent);

    setEditingCommentId(null);
    setOpenMenuId(null);
  }

  if (!comments || comments.length === 0){
    return (
      <p className="text-lg font-semibold">
        No comments yet...
      </p>
    )
  }

  return (
    <div className="mt-8">
      { comments.map((comment) =>(
        isLoading && (editingCommentId === comment._id || deletingCommentId === comment._id) ? (
          <div
            key={comment._id} 
            className="w-full flex justify-center items-center my-5 ml-9"
          >
            <LoaderCircle className="size-9 animate-spin [animation-duration:.6s] text-gray-400" />
          </div>
        ): (
          <div key={comment._id} className="flex items-start mb-4">
            <Link to={`/channel/${comment.user._id}`} className="mr-2 w-7 shrink-0">
              <img 
                className="w-full rounded-full bg-gray-300"
                src={comment.user.avatar ? comment.user.avatar: defaultUser} 
              />
            </Link>
            <div className="flex flex-col justify-start items-start">
              <Link
                to={`/channel/${comment.user._id}`}
                className="font-semibold text-gray-800 -mt-[6px]"
              >
                {comment.user.username}
              </Link>

              {editingCommentId === comment._id ? (
                <CommentInput editMode={true} initialComment={comment.content} onSubmit={(editedComment) => handleEdit(comment._id, editedComment)} onCancelEdit={onCancelEdit} />
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
                      </button>
                      {openMenuId === comment._id && (
                        <div
                          ref={menuRef} 
                          className="absolute z-50 top-7 right-3 border-2 py-2 px-3 bg-white rounded-lg"
                        >
                          <button 
                            onClick={() => handleDelete(comment._id)}
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
        )
      )) }

      {hasMore && <div className="flex justify-center items-center mt-2 mb-2">
        <button 
          className="text-blue-600 font-semibold cursor-pointer text-sm sm:text-[16px]"
          onClick={fetchComments}
        >
          {isLoading ? "Loading...": (
            <div className="flex items-center">
              <p>Load more</p>
              <ChevronsDown className="size-5 mt-0.5" />
            </div>
          )}
        </button>
      </div>}
    </div>
  )
}
export default CommentList;