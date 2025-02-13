import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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

const videoUpdate = async (req, res) =>{
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

export { videoPublish, videoUpdate };