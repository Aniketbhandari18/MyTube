import fs from "fs";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.["cover-image"]?.[0]?.path;

  try {
    // validation for empty fields
    if (
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !fullName?.trim()
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }], // checks by either username or email
    });

    if (existingUser) {
      throw new ApiError(
        400,
        "User with this email or username already exists"
      );
    }

    // handle images
    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

    // create user
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      avatar: avatar.url || null,
      coverImage: coverImage?.url || null,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    return res.status(200).json({
      message: "User registers successfully",
      user: createdUser,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error registering user",
    });
  } finally {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
    if (coverImageLocalpath) fs.unlinkSync(coverImageLocalpath);
  }
};

const loginUser = async (req, res) => {
  try {
    // access details
    const { username, email, password } = req.body;

    // validation for empty data
    if (!(username?.trim() || email?.trim())) {
      throw new ApiError(400, "Username or email is required");
    }
    if (!password?.trim()) {
      throw new ApiError(400, "Password is required");
    }

    // find user in database
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    // check if user exist
    if (!user) {
      throw new ApiError(
        400,
        "Account with this username or email doesn't exist"
      );
    }

    // match password
    if (!(await user.isPasswordCorrect(password.trim()))) {
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
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
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
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
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
  const { newUsername, newFullName, oldPassword, newPassword } = req.body;
  const newAvatarLocalPath = req.files?.avatar?.[0]?.path;
  const newCoverImageLocalpath = req.files?.["cover-image"]?.[0]?.path;

  const deleteAvatar = req.body.deleteAvatar === "true";
  const deleteCoverImage = req.body.deleteCoverImage === "true";

  try {
    const id = req.user._id; // user _id

    // old password without a new password
    if (oldPassword && !newPassword) {
      throw new ApiError(400, "New password is required");
    }
    // new password without an old password
    if (newPassword && !oldPassword) {
      throw new ApiError(400, "Old password is required");
    }

    // check for atleast one field
    if (
      !newUsername &&
      !newFullName &&
      !newAvatarLocalPath &&
      !newCoverImageLocalpath &&
      !oldPassword &&
      !newPassword
    ) {
      throw new ApiError(400, "Atleast one field is required");
    }

    const user = await User.findById(id);

    // Check for user
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { username, fullName, avatar, coverImage } = user;

    // update username
    if (newUsername) {
      if (newUsername === username) {
        throw new ApiError(400, "New username cannot be same as previous username");
      }

      user.username = newUsername;
    }

    // update fullname
    if (newFullName) {
      if (newFullName === fullName) {
        throw new ApiError(
          400,
          "New fullName cannot be same as previous fullName"
        );
      }

      user.fullName = newFullName;
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
    }

    // update avatar
    if (newAvatarLocalPath) {
      const newAvatar = await uploadOnCloudinary(newAvatarLocalPath);
      if (avatar) await deleteFromCloudinary(avatar);

      if (!newAvatar) {
        throw new ApiError(500, "Error uploading avatar");
      }

      user.avatar = newAvatar.url;
    }
    // update cover image
    if (newCoverImageLocalpath) {
      const newCoverImage = await uploadOnCloudinary(newCoverImageLocalpath);
      if (coverImage) await deleteFromCloudinary(coverImage);

      if (!newCoverImage) {
        throw new ApiError(500, "Error uploading cover image");
      }

      user.coverImage = newCoverImage.url;
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
        username: user.username,
        fullName: user.fullName,
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

const getUserProfileDetails = async (req, res) =>{
  try {
    const username = req.params.username?.trim();
  
    if (!username){
      throw new ApiError(400, "username not provided");
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
    //       fullName: 1,
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
    const channel = await User.findOne({ username });
  
    if (!channel) {
      throw new ApiError(404, "No such channel exists");
    }
  
    const [subscriberCount, subscribedToCount, isSubscribed] = await Promise.all([
      Subscription.countDocuments({ channel: channel._id }),
      Subscription.countDocuments({ subscriber: channel._id }),
      (req.user) ? Subscription.exists({ channel: channel._id, subscriber: req.user._id }): false
    ]);
  
    return res.status(200).json({
      message: "ok",
      user: {
        _id: channel._id,
        username: channel.username,
        fullName: channel.fullName,
        avatar: channel.avatar,
        coverImage: channel.coverImage,
        subscriberCount: subscriberCount,
        subscribedToCount: subscribedToCount,
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

export { registerUser, loginUser, logoutUser, refreshAccessToken, editProfile, getUserProfileDetails };