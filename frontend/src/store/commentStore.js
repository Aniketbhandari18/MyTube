import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useCommentStore = create((set, get) => ({
  videoId: null,
  comments: [],
  totalComments: 0,
  hasMore: true,
  isLoading: true,
  posting: false,
  error: null,
  
  setVideoId: (videoId) =>{
    set({ videoId })
  },

  setComments: (comments) =>{
    set({ comments: comments })
  },

  fetchComments: async () =>{
    if (!get().hasMore) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await axios({
        method: "GET",
        url: `${import.meta.env.VITE_API_BASE_URL}/comment/${get().videoId}`,
      })

      console.log("commentsData:", data)

      set({ 
        totalComments: data.totalComments,
        comments: [...get().comments, ...data.comments],
        hasMore: data.hasMore
      })
    } catch (err) {
      console.log(err);
      set({ error: err.response?.data?.message });
    } finally {
      set({ isLoading: false })
    }
  },

  addComment: async (comment) =>{
    if (!comment.trim()) return;
    set({ posting: true });

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/comment/${get().videoId}`, { content: comment });

      console.log(data);
      
      set({ totalComments: get().totalComments + 1, comments: [data.comment, ...get().comments] })
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401){
        toast.error("Please Login to comment")
      }
      else toast.error(err.response?.data?.message);
    } finally {
      set({ posting: false });
    }
  },

  deleteComment: async (commentId) =>{
    set({ isLoading: true });
    try {
      const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/comment/${commentId}`);
  
      console.log(data.deletedComment);

      set({
        totalComments: get().totalComments - 1,
        comments: get().comments.filter(({ _id }) => _id !== commentId)
      })
      
      toast.success("Comment deleted successfully")
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  editComment: async(commentId, editedContent) =>{
    if (!editedContent.trim()) return;

    set({ isLoading: true });

    try {
      const { data } = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/comment/${commentId}`, { editedContent });
      console.log(data)

      set({
        comments: get().comments.map((comment) =>
          comment._id === commentId ? {...comment, content: data.editedComment.content}: comment
        )
      })

      toast.success("Comment edited successfully");
    } catch (err) {
      console.log(err);
      toast.error("Failed to edit comment");
    } finally {
      set({ isLoading: false });
    }
  }
}))