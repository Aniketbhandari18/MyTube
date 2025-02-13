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

export { handleEngagement };