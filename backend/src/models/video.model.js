import { Schema, model } from "mongoose";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // third party service url
      required: true
    },
    thumbnail: {
      type: String, // third party service url
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      required: true, 
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

export const Video = model("Video", videoSchema);