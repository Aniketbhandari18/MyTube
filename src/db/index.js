import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

import express from "express";

const app = express();

async function connectDB(){
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log('MongoDB connected');

    app.on("error", (error) =>{
      console.log("Error: ", error);
      throw error;
    })

    app.listen(process.env.PORT, () =>{
      console.log(`Server is listening on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log("MongoDB connection error: ", error);
    process.exit(1);
  }
}

export default connectDB;