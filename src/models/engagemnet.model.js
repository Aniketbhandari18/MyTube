import { Schema, model } from "mongoose";

const engagementSchema = new Schema({
  user: { // one who liked or disliked
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  video: { // video to which the user liked or disliked
    type: Schema.Types.ObjectId,
    ref: "Video"
  },
  action: {
    type: String,
    enum: ["like", "dislike"],
    required: true
  }
});

export const Engagement = model("Engagement", engagementSchema);