import dotenv from "dotenv"; // i have to remove it (already put it in index.js, but not working)
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { extractPublicId } from 'cloudinary-build-url'

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
    
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const deleteFromCloudinary = async (url) =>{
  const publicId = extractPublicId(url);

  await cloudinary.uploader.destroy(publicId);
}

export { uploadOnCloudinary, deleteFromCloudinary };