import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { sendResetPasswordSuccessMail, sendResetPasswordToken, sendVerificationMail } from "../utils/nodemail.js";
import crypto from "crypto";
import mongoose from "mongoose";

const registerUser = async (req, res) => {
  // const { username, email, password } = req.body;
  const username = req.body.username?.trim().toLowerCase();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password?.trim();

  try {
    // validation for empty fields
    if (!username ||!email ||!password){
      throw new ApiError(400, "All fields are required");
    }

    // check if user already exists
    const existingUser = await User.findOne({
      // checks by either username or email
      $or: [{ username}, { email }], 
    });

    if (existingUser && existingUser.isVerified) {
      throw new ApiError(
        400,
        "User with this email or username already exists"
      );
    }

    // verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // resend otp if not verified
    if (existingUser && !existingUser.isVerified){
      await sendVerificationMail(existingUser.email, verificationCode);
      existingUser.verificationCode = verificationCode;
      existingUser.verificationCodeExpiresAt = verificationCodeExpiresAt;

      await existingUser.save();

      // Generate new verification JWT
      const verificationToken = existingUser.generateVerificationToken();

      // Store JWT in httpOnly cookies
      res.cookie("verificationToken", verificationToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      
      return res.status(200).json({
        message: "Email already registered. New verification token sent",
        user: existingUser,
        isNewUser: false
      });
    }

    // create user
    const newUser = await User.create({
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpiresAt,
    });

    
    const verificationToken = newUser.generateVerificationToken();

    // store verificationToken in cookies
    const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "None"
    };

    res.cookie("verificationToken", verificationToken, options);

    // send verification email
    try {
      await sendVerificationMail(newUser.email, verificationCode);
    } catch (error) {
      throw new ApiError(400, "Error sending verification mail");
    }

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    return res.status(200).json({
      message: "User registered successfully",
      user: createdUser,
      isNewUser: true
    });
  } catch (error) {
    console.log(error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error registering user",
    });
  }
};

const verifyUser = async (req, res) =>{
  try {
    const { verificationCode } = req.body;
    const userId = req.user._id;
  
    const user = await User.findById(userId);
  
    if (!verificationCode){
      throw new ApiError(400, "Verification code is missing");
    }
  
    if (!user){
      throw new ApiError(404, "User doesn't exist");
    }
  
    if (user.isVerified){
      throw new ApiError(409, "User already verified");
    }
  
    if (verificationCode !== user.verificationCode){
      throw new ApiError(400, "Invalid or expired verification code");
    }

    if (Date.now() >= user.verificationCodeExpiresAt.getTime()){
      throw new ApiError(400, "Verification code expired");
    }
  
    // set user verified
    user.isVerified = true;
    user.verificationCode = undefined; // Clear the code
    user.verificationCodeExpiresAt = undefined; // Clear expiration
  
    await user.save();

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    res.clearCookie("verificationToken", options);

    return res.status(200).json({
      message: "User verified successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

const requestPasswordReset = async (req, res) =>{
  try {
    const { identifier } = req.body;
  
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
  
    if (!user){
      throw new ApiError(404, "Account with this username or email doesn't exist");
    }
    
    // store reset-password-token in mongodb
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    await user.save();

    // send email
    await sendResetPasswordToken(user.email, resetPasswordToken);

    return res.status(200).json({
      message: "Reset-password-token sent successfully",
      email: user.email
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error sending reset-password-token email"
    })
  }
};

const resetPassword = async (req, res) =>{
  try {
    const { password } = req.body;
    const { resetPasswordToken } = req.params;
  
    const user = await User.findOne({ 
      resetPasswordToken,
      resetPasswordTokenExpiresAt: { $gt: Date.now() }
     });
  
    if (!user){
      throw new ApiError(400, "Invalid or expired token");
    }
  
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;
  
    await user.save();

    try {
      await sendResetPasswordSuccessMail(user.email);
    } catch (error) {
      throw new ApiError(500, "Failed to send password reset successfull mail")
    }

    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    // access details
    const identifier = req.body.identifier?.trim().toLowerCase(); // username or email
    const password = req.body.password?.trim();

    // validation for empty data
    if (!identifier) {
      throw new ApiError(400, "Username or email is required");
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    // find user in database
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    // check if user exist
    if (!user) {
      throw new ApiError(
        400,
        "Account with this username or email doesn't exist"
      );
    }

    // check if user is verified
    if (!user.isVerified) {
      throw new ApiError(403, "Account is not verified. Please verify your email before logging in.");
    }

    // match password
    if (!(await user.isPasswordCorrect(password))) {
      throw new ApiError(400, "Incorrect password");
    }

    // generate access and refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refreshToken in database
    user.refreshToken = refreshToken;
    await user.save(); // save

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // send cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, {...options, maxAge: 24 * 60 * 60 * 1000})
      .cookie("refreshToken", refreshToken, {...options, maxAge: 7 * 24 * 60 * 60 * 1000})
      .json({
        message: "User logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error while processing your login request",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    // remove refreshToken from mongodb
    const id = req.user._id;

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    // Check for user
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    // remove cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Logged out successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "An error occurred while logging out",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Invalid or expired refreshToken");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    // Check for user
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if the user is verified
    if (!user.isVerified) {
      throw new ApiError(403, "User is not verified");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refreshToken");
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    // store new refreshToken in mongodb;
    user.refreshToken = newRefreshToken;
    await user.save();

    // store access and refresh token in cookies
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None"
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, {...options, maxAge: 24 * 60 * 60 * 1000})
      .cookie("refreshToken", newRefreshToken, {...options, maxAge: 7 * 24 * 60 * 60 * 1000})
      .json({
        message: "AccessToken refreshed successfully",
      });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 401).json({
      message: error.message || "Invalid or expired refresh token",
    });
  }
};

const editProfile = async (req, res) => {
  const newUsername = req.body.username?.trim().toLowerCase();
  const newDescription = req.body.description?.trim().toLowerCase();
  const newAvatarLocalPath = req.files?.avatar?.[0]?.path;
  const newCoverImageLocalpath = req.files?.["cover-image"]?.[0]?.path;

  const deleteAvatar = req.body.deleteAvatar === "true";
  const deleteCoverImage = req.body.deleteCoverImage === "true";

  try {
    const id = req.user._id; // user _id

    if (
      !newUsername &&
      !newDescription &&
      !newAvatarLocalPath &&
      !newCoverImageLocalpath
    ) {
      throw new ApiError(400, "Atleast one field is required");
    }

    const user = await User.findById(id);

    // Check for user
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { username, description, avatar, coverImage } = user;

    // update username
    if (newUsername) {
      if (newUsername === username) {
        throw new ApiError(400, "New username cannot be same as previous username");
      }

      const usernameExisting = await User.findOne({ username: newUsername });
      if (usernameExisting){
        throw new ApiError(400, "Username is already taken");
      }

      user.username = newUsername;
    }

    // update description
    if (newDescription){
      if (newDescription === description){
        throw new ApiError(400, "New description cannot be same as previous description");
      }

      user.description = newDescription;
    }

    // update avatar
    if (newAvatarLocalPath) {
      const newAvatar = await uploadOnCloudinary(newAvatarLocalPath);
      if (avatar) await deleteFromCloudinary(avatar);

      if (!newAvatar) {
        throw new ApiError(500, "Error uploading avatar");
      }

      user.avatar = newAvatar.secure_url;
    }
    // update cover image
    if (newCoverImageLocalpath) {
      const newCoverImage = await uploadOnCloudinary(newCoverImageLocalpath);
      if (coverImage) await deleteFromCloudinary(coverImage);

      if (!newCoverImage) {
        throw new ApiError(500, "Error uploading cover image");
      }

      user.coverImage = newCoverImage.secure_url;
    }

    // deleter avatar
    if (deleteAvatar && avatar) {
      await deleteFromCloudinary(avatar);
      user.avatar = null;
    }

    // deleter cover image
    if (deleteCoverImage && coverImage) {
      await deleteFromCloudinary(coverImage);
      user.coverImage = null;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated succesfully",
      user: {
        _id: user._id,
        username: user.username,
        description: user.description,
        avatar: user.avatar,
        coverImage: user.coverImage,
      },
    });
  } catch (error) {
    console.log("Error updating profile", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Error updating profile",
    });
  } finally {
    if (newAvatarLocalPath) fs.unlinkSync(newAvatarLocalPath);
    if (newCoverImageLocalpath) fs.unlinkSync(newCoverImageLocalpath);
  }
};

const editPassword = async (req, res) =>{
  try {
    const id = req.user._id;
    console.log(req.body);
    console.log(req.body.oldPassword)
    const oldPassword = req.body.oldPassword?.trim();
    const newPassword = req.body.newPassword?.trim();
  
    const user = await User.findById(id);
  
    // Check for user
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // old password without a new password
    if (oldPassword && !newPassword) {
      throw new ApiError(400, "New password is required");
    }
    // new password without an old password
    if (newPassword && !oldPassword) {
      throw new ApiError(400, "Old password is required");
    }
  
    // update password
    if (oldPassword && newPassword) {
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  
      if (!isPasswordCorrect) {
        throw new ApiError(400, "Wrong password");
      }
  
      if (oldPassword === newPassword) {
        throw new ApiError(400, "New password cannot be same as old password");
      }
  
      user.password = newPassword;
  
      await user.save();
  
      return res.status(200).json({
        message: "Password updated successfully",
        user: {
          _id: user._id,
          username: user.username,
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error updating password",
    });
  }
}

const getUserProfileDetails = async (req, res) =>{
  try {
    const channelIdentifier = req.params.channelIdentifier?.trim().toLowerCase();
  
    if (!channelIdentifier){
      throw new ApiError(400, "username or id not provided");
    }
  
    // code with aggregaton pipeline
    // User.aggregate([
    //   {
    //     $match: {
    //       username: username.trim()
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "channel",
    //       as: "subscribers"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "subscriptions",
    //       localField: "_id",
    //       foreignField: "subscriber",
    //       as: "subscribedTo"
    //     }
    //   },
    //   {
    //     $addFields: {
    //       subscriberCount: {
    //         $size: "$subscribers"
    //       },
    //       subscribedToCount: {
    //         $size: "$subscribedTo"
    //       },
    //       isSubscribed: {
    //         $cond: {
    //           if: {$in: [req.user?._id, $subscribers.subscriber]},
    //           then: true,
    //           else: false
    //         }
    //       }
    //     }
    //   },
    //   {
    //     $project: {
    //       username: 1,
    //       avatar: 1,
    //       coverImage: 1,
    //       subscriberCount: 1,
    //       subscribedToCount: 1,
    //       isSubscribed: 1,
    //       createdAt: 1
    //     }
    //   }
    // ]);
  
    // my code without aggregation pipeline
    const isValidId = mongoose.Types.ObjectId.isValid(channelIdentifier);

    const orQuery = [{ username: channelIdentifier }];
    if (isValidId) orQuery.push({ _id: channelIdentifier });
    
    const channel = await User.findOne({
      $or: orQuery,
      isVerified: true
    });
  
    if (!channel) {
      throw new ApiError(404, "No such channel exists");
    }
  
    const [subscriberCount, isSubscribed] = await Promise.all([
      Subscription.countDocuments({ channel: channel._id }),
      (req.user) ? Subscription.exists({ channel: channel._id, subscriber: req.user._id }): false
    ]);
  
    return res.status(200).json({
      message: "ok",
      user: {
        _id: channel._id,
        username: channel.username,
        description: channel.description,
        avatar: channel.avatar,
        coverImage: channel.coverImage,
        subscriberCount: subscriberCount,
        isSubscribed: !!isSubscribed
      }
    })
  } catch (error) {
    console.log(error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    })
  }
}

const deleteUserProfile = async (req, res) =>{
  try {
    const userId = req.user._id;
  
    await User.findByIdAndDelete(userId);
  
    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error deleting user"
    });
  }
};

const checkAuth = async (req, res) =>{
  try {
    if (!req.user){
      throw new ApiError(400, "User not found");
    }
  
    const user = await User.findById(req.user._id);
  
    if (!user){
      throw new ApiError(404, "User not found");
    }
  
    return res.status(200).json({
      message: "User fetched successfully",
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal Server Error"
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  editProfile,
  editPassword,
  getUserProfileDetails,
  deleteUserProfile,
  verifyUser,
  requestPasswordReset,
  resetPassword,
  checkAuth
};