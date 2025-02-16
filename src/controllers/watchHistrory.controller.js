import { WatchHistory } from "../models/watchHistory.model.js";
import { ApiError } from "../utils/ApiError.js";

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

const removeVideoFromWatchHistory = async (req, res) =>{
  try {
    const { watchHistoryId } = req.params;
  
    const removedVideo = await WatchHistory.findByIdAndDelete(watchHistoryId);

    if (!removedVideo){
      throw new ApiError(404, "Video not found in watch history");
    }
  
    return res.status(200).json({
      message: "Video removed from watch history",
      removedVideo: removedVideo
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

const getWatchHistory = async (req, res) =>{
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 0;
    const videosPerPage = parseInt(req.query.limit, 10) || 20;

    const totalVideos = await WatchHistory.countDocuments({ user: userId });
    const hasMore = totalVideos > (page + 1) * videosPerPage;
  
    const watchHistory = await WatchHistory
      .find({ user: userId })
      .skip(page * videosPerPage)
      .limit(videosPerPage)
      .sort({ createdAt: -1 })
      .populate({
        path: "video",
        select: "_id thumbnail title duration owner views createdAt",
        populate: {
          path: "owner",
          select: "_id username"
        }
      });

    return res.status(200).json({
      message: "Watch history fetched successfully",
      totalVideos: totalVideos,
      watchHistory: watchHistory,
      hasMore: hasMore
    });
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

export { getWatchHistory, addVideoToWatchHistory, removeVideoFromWatchHistory };