import mongoose from "mongoose";
import { User } from "../../models/user.model.js";
import connectDB from "../../db/index.js";

import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

const deleteFakeUsers = async () =>{
  try {
    await connectDB();
    console.log("MongoDB connected");
  
    await User.deleteMany({ isFake: true });
    console.log("Deleted all fake users");
  } catch (error) {
    console.log("Error deleting fake users: ", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

deleteFakeUsers();