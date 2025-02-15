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
      comment: content,
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

export { addComment };