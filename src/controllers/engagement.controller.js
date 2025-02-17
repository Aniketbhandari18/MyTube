import { Engagement } from "../models/engagement.model.js";
import { ApiError } from "../utils/ApiError.js";

const handleEngagement = async (req, res) =>{
  try {
    const { videoId } = req.params;
    const { action } = req.body;
    const user = req.user;
  
    if (!["like", "dislike"].includes(action)){
      throw new ApiError(400, "Invalid action. Must be 'like' or 'dislike'");
    }
  
    const existingEngagement = await Engagement.findOne({ user: user._id, video: videoId });
  
    if (existingEngagement){
      if (action === existingEngagement.action){
        await existingEngagement.deleteOne();
        return res.status(200).json({
          message: "Engagement removed successfully"
        })
      }
      
      else{
        existingEngagement.action = action;
        await existingEngagement.save();

        return res.status(200).json({
          message: "Engagement updated successfully",
          engagement: existingEngagement
        })
      }
    }
    else{
      const updatedEngagement = await Engagement.create({
        user: user._id,
        video: videoId,
        action: action
      });

      return res.status(201).json({
        message: "Engagement created successfully",
        engagement: updatedEngagement
      })
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

const getLikedVideos = async (req, res) =>{
  try {
    const userId = req.user._id;
    const page = parseInt(req.query?.page, 10) || 0;
    const videosPerPage = parseInt(req.query.limit, 10) || 20;
    
    const totalVideos = await Engagement.countDocuments({ user: userId, action: "like" });
    const hasMore = totalVideos > (page + 1) * videosPerPage;

    const likedVideos = await Engagement
      .find({ user: userId, action: "like" })
      .sort({ createdAt: -1 })
      .skip(page * videosPerPage)
      .limit(videosPerPage)
      .populate({
        path: "video",
        select: "_id thumbnail title duration views createdAt",
        populate: {
          path: "owner",
          select: "_id username"
        }
      })
      .select("-action -user");
  
    return res.status(200).json({
      message: "Liked videos fetched successfully",
      likedVideosCount: totalVideos,
      likedVideos: likedVideos,
      hasMore: hasMore
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching liked vidoes",
    });
  }
};

// Helper functions
const countEngagements = (videoId, action) =>{
  return Engagement.countDocuments({ video: videoId, action: action });
}

export { handleEngagement, countEngagements, getLikedVideos };