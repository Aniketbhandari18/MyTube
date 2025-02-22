import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

const addComment = async (req, res) =>{
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    const video = await Video.findById(videoId);

    if (!video){
      throw new ApiError(404, "Video doesn't exist");
    }

    if (!content?.trim()){
      throw new ApiError(400, "Comment cannot be empty");
    }
  
    const createdComment = await Comment.create({
      content: content,
      user: userId,
      video: videoId
    })

    await createdComment.populate("user", "_id username avatar");

    return res.status(201).json({
      message: "Comment added successfully",
      comment: createdComment
    })
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

const editComment = async (req, res) =>{
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const { editedContent } = req.body;

    // Check if comment is empty
    if (!editedContent?.trim()){
      throw new ApiError(400, "Comment cannot be empty");
    }
    
    // Find existing comment
    const existingComment = await Comment.findById(commentId);
  
    if (!existingComment){
      throw new ApiError(404, "Comment doesn't exist");
    }
    
    // Match if comment belong to the logged-in user
    if (existingComment.user.toString() !== userId.toString()){
      throw new ApiError(403, "You do not have permission to edit this comment");
    }
    
    // Check if edited comment is same as previous comment
    if (editedContent.trim() === existingComment.content){
      throw new ApiError(400, "Edited comment cannot be same as previous comment");
    }
  
    existingComment.content = editedContent;
  
    const editedComment = await existingComment.save();
  
    return res.status(200).json({
      message: "Comment edited successfully",
      editedComment: editedComment
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
}

const deleteComment = async (req, res) =>{
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
  
    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId
    });
  
    if (!deletedComment){
      const existingComment = await Comment.findById(commentId);
      if (existingComment) {
        throw new ApiError(403, "You don't have permission to delete this comment");
      }
      throw new ApiError(404, "Comment doesn't exist");
    }
  
    return res.status(200).json({
      message: "Comment deleted successfully",
      deletedComment: deletedComment
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error",
    });
  }
}

const getVideoComments = async (req, res) =>{
  try {
    const { videoId } = req.params;
    const { page } = req.query;
  
    const pageNumber = Math.max(parseInt(page, 10) || 0, 0);
    const commentsPerPage = 20;

    const totalComments = await Comment.countDocuments({ video: videoId });
    const hasMore = (totalComments > (pageNumber + 1) * commentsPerPage);

    const comments = await Comment
      .find({ video: videoId })
      .sort({ updatedAt: -1 })
      .skip(pageNumber * commentsPerPage)
      .limit(commentsPerPage)
      .populate("user", "username avatar");

    return res.status(200).json({
      message: "Comments fetched successfully",
      totalComments: totalComments,
      comments: comments,
      hasMore: hasMore
    })
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

export { addComment, editComment, deleteComment, getVideoComments };