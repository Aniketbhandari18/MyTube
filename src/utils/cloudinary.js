import dotenv from "dotenv"; // i have to remove it (already put it in index.js, but not working)
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file has been uploaded successfully");
    fs.unlinkSync(localFilePath); // remove locally saved file

    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath); // remove locally saved file
    return null;
  }
};

export { uploadOnCloudinary };
