import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const videoPublish = async (req, res) =>{
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
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
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

export { videoPublish };