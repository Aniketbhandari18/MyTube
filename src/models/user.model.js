import mongoose, { Schema, model } from "mongoose";

import bcryptjs from "bcryptjs"; // for encryption
import jwt from "jsonwebtoken";

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
      trim: true,
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
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// encrypt password before saving data
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

//checks if the password is correct
userSchema.methods.isPasswordCorrect = async function (password){
  return await bcryptjs.compare(password, this.password);
}

export const User = model("User", userSchema);
