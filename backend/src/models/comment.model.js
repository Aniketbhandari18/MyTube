import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  },
  {
    timestamps: true
  }
);

export const Comment = model("Comment", commentSchema);