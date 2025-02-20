import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { countSubscribers, isSubscribed } from "./subscription.controller.js";
import { countEngagements, userEngagement } from "./engagement.controller.js";

const homeVideos = async (req, res) =>{
  try {
    const page = parseInt(req.query.page, 10) || 0;
    const videosPerPage = 30;
  
    const result = await Video
      .find({})
      .sort({ views: -1 })
      .skip(page * videosPerPage)
      .limit(videosPerPage + 1)
      .populate("owner", "_id username avatar");
  
    const hasMore = result.length > videosPerPage;
    if (hasMore) result.pop();

    // shuffle result
    const shuffledResult = result.sort(() => Math.random() - 0.5);
  
    return res.status(200).json({
      message: "Vidoes fetched successfully",
      result: shuffledResult,
      hasMore
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching videos"
    });
  }
};

const searchResults = async (req, res) =>{
  try {
    const searchQuery = req.query.search_query?.trim();
    const userId = req.user?._id;
  
    const page = parseInt(req.query.page, 10) || 0;
    const videosPerPage = 30;
  
    const videoResults = await Video.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: searchQuery,
            path: ["title", "description"],
            fuzzy: { maxEdits: 2 }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "channel",
        }
      },
      {
        $unwind: "$channel"
      },
      {
        $project: {
          "_id": 1,
          "title": 1,
          "description": 1,
          "thumbnail": 1,
          "duration": 1,
          "views": 1,
          "channel._id": 1,
          "channel.username": 1,
          "channel.avatar": 1,
          "createdAt": 1,
          "score": { $meta: "searchScore" },
        }
      },
      {
        $sort: { "score": -1 }
      },
      {
        $skip: page * videosPerPage
      },
      {
        $limit: videosPerPage + 1
      }
    ]);

    const channelResults = await User.aggregate([
      {
        $match: {
          $text: {$search: searchQuery}
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          avatar: 1,
          subscribers: 1,
          createdAt: 1,
          score: { $meta: "textScore" },
        },
      },
      {
        $sort: { "score": -1 }
      },
      {
        $limit: 2
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        }
      },
      {
        $addFields: {
          isSubscribed: {
            $cond: {
              if: {$in: [userId, "$subscribers.subscriber"]},
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: {
          subscribers: 0
        }
      }
    ]);

    const hasMore = videoResults.length > videosPerPage;
    if (hasMore) videoResults.pop();
  
    return res.status(200).json({
      message: "Videos fetched successfully",
      channelResults,
      videoResults,
      hasMore
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

const getVideoById = async (req, res) =>{
  try {
    const { videoId } = req.params;
    const userId = req.user?._id;
  
    // find video
    const video = await Video.findById(videoId);
  
    if (!video){
      throw new ApiError(400, "Video doesn't exists");
    }
  
    // access details
    const { title, description, videoFile, thumbnail, owner } =  video;
  
    // find owner (one who published the video)
    const channel = await User.findById(owner);
  
    if (!channel){
      throw new ApiError(400, "Channel doesn't exist anymore");
    }
  
    const { username, avatar } = channel;

    const [subscriberCount, subscribed, likesCount, dislikesCount, engagement] = await Promise.all([
      countSubscribers(channel._id),
      userId ? isSubscribed(channel._id, userId) : 0,
      countEngagements(videoId, "like"),
      countEngagements(videoId, "dislike"),
      userId ? userEngagement(videoId, userId): null
    ]);
  
    return res.status(200).json({
      message: "ok",
      video: {
        _id: video._id,
        title,
        description,
        videoFile,
        thumbnail,
      },
      channel: {
        _id: channel._id,
        username,
        avatar,
        subscriberCount,
        isSubscribed: !!subscribed
      },
      engagement: {
        likesCount,
        dislikesCount,
        engagement
      }
    })
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

const publishVideo = async (req, res) =>{
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;
  const videoLocalPath = req.files?.video?.[0].path;

  try {
    const { title, description } = req.body;
    const userId = req.user._id;
  
    // validation
    if (!userId){
      throw new ApiError(404, "User not found");
    }
  
    if (!title){
      throw new ApiError(400, "Video title is required");
    }
  
    if (!thumbnailLocalPath){
      throw new ApiError(400, "Video thumbnail is required");
    }
  
    if (!videoLocalPath){
      throw new ApiError(400, "Video file is required");
    }
  
    // upload on cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const videoFile = await uploadOnCloudinary(videoLocalPath, { resource_type: "video" });
  
    if (!thumbnail || !videoFile){
      throw new ApiError(500, "Error uploading video");
    }
  
    // console.log(thumbnail);
    // console.log(videoFile);
  
    const response = await Video.create({
      videoFile: videoFile.secure_url,
      thumbnail: thumbnail.secure_url,
      title: title,
      description: description || "",
      duration: videoFile.duration,
      owner: userId
    });
  
    // console.log(response);

    res.status(201).json({
      message: "Video published successfully",
      response
    });
  } catch (error) {
    console.log(error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  } finally {
    if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
    if (videoLocalPath) fs.unlinkSync(videoLocalPath);
  }
}

const updateVideo = async (req, res) =>{
  const thumbnailLocalPath = req.file?.path;

  try {
    const { videoId } = req.params;
    const user = req.user;
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
  
    const existingVideo = await Video.findById(videoId);
  
    if (!existingVideo){
      throw new ApiError(400, "Video doesn't exist");
    }

    if (existingVideo.owner.toString() !== user._id.toString()){
      throw new ApiError(403, "You do not have this permission");
    }
    
    // validation
    if (!title && !description && !thumbnailLocalPath){
      throw new ApiError(400, "Atleast one field is required to update");
    }
    
    // update title
    if (title){
      if (existingVideo.title === title){
        throw new ApiError(400, "New title cannot be same as previous title");
      }

      existingVideo.title = title;
    }

    // update description
    if (description){
      if (existingVideo.description === description){
        throw new ApiError(400, "New description cannot be same as previous description");
      }

      existingVideo.description = description;
    }

    // update thumbnail
    if (thumbnailLocalPath){
      const newThumnail = await uploadOnCloudinary(thumbnailLocalPath);
      
      if (!newThumnail){
        throw new ApiError(500, "Error uploading file");
      }

      await deleteFromCloudinary(existingVideo.thumbnail);

      existingVideo.thumbnail = newThumnail.secure_url;
    }
  
    await existingVideo.save();
  
    res.status(200).json({
      message: "Video details updated succesfully",
      video: {
        _id: existingVideo._id,
        title: existingVideo.title,
        description: existingVideo.description,
        thumbnail: existingVideo.thumbnail,
        videoFile: existingVideo.videoFile
      }
    })
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  } finally {
    if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
  }
}

const deleteVideo = async (req, res) =>{
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);

    if (!video){
      throw new ApiError(404, "Video doesn't exist");
    }

    if (userId.toString() !== video.owner.toString()){
      throw new ApiError(403, "You are not authorized to delete this video");
    }
  
    const deletedVideo = await Video.findByIdAndDelete(videoId);
  
    return res.status(200).json({
      message: "Video deleted successfully",
      deletedVideo: deletedVideo
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error deleting video"
    });
  }
};

const incrementView = async (req, res) =>{
  try {
    const { videoId } = req.params;
  
    const updateVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updateVideo){
      throw new ApiError(404, "Video doesn't exist");
    }

    return res.status(200).json({
      message: "View count incremented successfully",
      video: updateVideo
    })
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

export { publishVideo, updateVideo, incrementView, deleteVideo, getVideoById, searchResults, homeVideos };