import { Schema, model } from "mongoose";

const watchHistorySchema = new Schema(
  {
    user: { // One who has watched the video
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }
)

export const WatchHistory = model("WatchHistory", watchHistorySchema);