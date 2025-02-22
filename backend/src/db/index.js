import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


async function connectDB(){
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('MongoDB connected');

  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
}

export default connectDB;