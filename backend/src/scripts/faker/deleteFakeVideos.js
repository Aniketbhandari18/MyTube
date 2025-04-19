import mongoose from "mongoose";
import connectDB from "../../db/index.js";
import { User } from "../../models/user.model.js";
import { Video } from "../../models/video.model.js";

import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

const deleteFakeVideos = async () => {
  try {
    await connectDB();
    console.log("MongoDB connected");

    await User.deleteMany({ isFake: true });
    console.log("Deleted all fake users");

    await Video.deleteMany({ isFake: true });
    console.log("Deleted all fake videos");
  } catch (error) {
    console.log("Error deleting fake videos: ", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

deleteFakeVideos();