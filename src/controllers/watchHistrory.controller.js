import { WatchHistory } from "../models/watchHistory.model.js";

const addVideoToWatchHistory = async(req, res) =>{
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const existingHistory = await WatchHistory.findOne({ user: userId, video: videoId });

    if (existingHistory){
      existingHistory.watchedAt = Date.now();

      await existingHistory.save();
  
      return res.status(200).json({
        message: "Watch history updated successfully",
        watchHistory: existingHistory
      })
    }
  
    const watchHistory = await WatchHistory.create({
      user: userId,
      video: videoId,
      watchedAt: Date.now()
    });
  
    return res.status(201).json({
      message: "Video added to watch history",
      watchHistory: watchHistory
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

export { addVideoToWatchHistory };