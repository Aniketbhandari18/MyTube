import fs from "fs";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const avatarLocalPath = req.files.avatar?.[0]?.path;
  const coverImageLocalpath = req.files["cover-image"]?.[0]?.path;

  try {
    // validation for empty fields
    if (
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !fullName?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }], // checks by either username or email
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      });
    }

    // handle images

    // check for avatar (mandatory)
    if (!avatarLocalPath) {
      return res.status(400).json({
        message: "Avatar is required",
      });
    }

    // upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  // create user
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    return res.status(200).json({
      message: "User registers successfully",
      user: createdUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error registering user",
    });
  }
    finally{
      if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
      if (coverImageLocalpath) fs.unlinkSync(coverImageLocalpath);
    }
};

const loginUser = async (req, res) =>{
  // access details
  const { username, email, password } = req.body;

  // validation for empty data
  if ( !(username?.trim() || email?.trim()) ){
    return res.status(400).json({
      message: "Username or email is required"
    })
  }
  if (!password?.trim()){
    return res.status(400).json({
      message: "Password is required" 
    })
  }

  // find user in database
  try {
    const user = await User.findOne({
      $or: [{ username }, { email }]
    })
    
    // check if user exist
    if (!user){
      return res.status(400).json({
        message: "Account with this username or email doesn't exist"
      })
    }
  
    // match password
    if (!await user.isPasswordCorrect(password.trim())){
      return res.status(400).json({
        message: "Incorrect password"
      })
    }

    // generate access and refresh token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refreshToken in database
    user.refreshToken = refreshToken;
    await user.save(); // save

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // send cookies
    const options = {
      httpOnly: true,
      secure: true
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User logged in successfully",
        user: loggedInUser,
        accessToken,
        refreshToken
      });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while processing your login request"
    })
  }
}

const logoutUser = async (req, res) =>{
  try {
    // remove refreshToken from mongodb
    const id = req.user._id;
  
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          refreshToken: undefined
        }
      },
      {
        new: true
      }
    )
    
    // this might be unnecessary
    if (!user){
      return res.status(404).json({
        message: "User does not exist"
      })
    }
  
    // remove cookies
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({
        message: "Logged out successfully",
      })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while logging out"
    })
  }
}

const refreshAccessToken = async (req, res) =>{
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;
  
    if (!incomingRefreshToken){
      return res.status(403).json({
        message: "Invalid or expired refreshToken"
      })
    }
  
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user){
      return res.status(401).json({
        message: "User not found"
      })
    }
  
    if (incomingRefreshToken !== user.refreshToken){
      return res.status(403).json({
        message: "Invalid refreshToken"
      })
    }
  
    const newAccessToken = User.generateAccessToken();
    const newRefreshToken = User.generateRefreshToken();
  
    // store new refreshToken in mongodb;
    user.refreshToken = newRefreshToken;
    await user.save();
  
    // store access and refresh token in cookies
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        message: "AccessToken refreshed successfully"
      });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      message: "Invalid or expired refresh token"
    })
  }
}

const editProfile = async (req, res) =>{
  const {newUsername, newFullName, oldPassword, newPassword} = req.body;
  const newAvatarLocalPath = req.files.avatar?.[0]?.path;
  const newCoverImageLocalpath = req.files["cover-image"]?.[0]?.path;

  try {
    const id = req.user._id; // user _id
    

    // old password without a new password
    if (oldPassword && !newPassword){
      return res.status(400).json({
        message: "New password is required"
      })
    }
    // new password without an old password
    if (newPassword && !oldPassword){
      return res.status(400).json({
        message: "Old password is required"
      })
    }


    // check for atleast one field
    if (!newUsername && !newFullName && !newAvatarLocalPath && !newCoverImageLocalpath && (!oldPassword && !newPassword)){
      return res.status(400).json({
        message: "Atleast one field is required"
      })
    }
  
  
    const user = await User.findById(id);
  
    if (!user){
      return res.status(404).json({
        message: "User not found"
      })
    }
  
    const { username, fullName, avatar, coverImage } = user;
  
    // update username
    if (newUsername){
      if (newUsername === username){
        return res.status(400).json({
          message: "New username cannot be same as previous username"
        })
      }
  
      user.username = newUsername;
    }
  
    // update fullname
    if (newFullName){
      if (newFullName === fullName){
        return res.status(400).json({
          message: "New fullName cannot be same as previous fullName"
        })
      }
  
      user.fullName = newFullName;
    }
  
  
    // update password
    if (oldPassword && newPassword){
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  
      if (!isPasswordCorrect){
        return res.status(400).json({
          message: "Wrong password"
        })
      }
  
      if (oldPassword === newPassword){
        return res.status(400).json({
          message: "New password cannot be the same as old password"
        })
      }
  
      user.password = newPassword;
    }


    // update avatar
    if (newAvatarLocalPath){
      const newAvatar = await uploadOnCloudinary(newAvatarLocalPath);
      if (avatar) await deleteFromCloudinary(avatar);

      if (!newAvatar){
        return res.status(500).json({
          message: "Error uploding avatar"
        })
      }

      user.avatar = newAvatar.url;
    }
    // update cover image
    if (newCoverImageLocalpath){
      const newCoverImage = await uploadOnCloudinary(newCoverImageLocalpath);
      if (coverImage) await deleteFromCloudinary(coverImage);

      if (!newCoverImage){
        return res.status(500).json({
          message: "Error uploding cover image"
        })
      }

      user.coverImage = newCoverImage.url;
    }
  
    await user.save();

    return res.status(200).json({
      message: "Profile updated succesfully"
    })

  } catch (error) {
    console.log("Error updating profile", error);

    return res.status(500).json({
      message: "Internal server error"
    })
  }
  finally{
    if (newAvatarLocalPath) fs.unlinkSync(newAvatarLocalPath);
    if (newCoverImageLocalpath) fs.unlinkSync(newCoverImageLocalpath);
  }
}

export { registerUser, loginUser, logoutUser, refreshAccessToken, editProfile };