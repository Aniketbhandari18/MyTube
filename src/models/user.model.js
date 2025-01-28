import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // third party service url
      required: true,
    },
    coverImage: {
      type: String, // third party service url
    },
    watchHistory: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Video",
        },
      ],
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

export const User = model("User", userSchema);
