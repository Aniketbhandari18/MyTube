import fs from "fs";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const avatarLocalPath = req.files.avatar?.[0]?.path;
  const coverImageLocalpath = req.files["cover-image"]?.[0]?.path;

  // validation for empty fields
  if (
    !username?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !fullName?.trim()
  ) {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
    if (coverImageLocalpath) fs.unlinkSync(coverImageLocalpath);

    return res.status(400).json({
      message: "All fields are required",
    });
  }

  // check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], // checks by either username or email
  });

  if (existingUser) {
    if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
    if (coverImageLocalpath) fs.unlinkSync(coverImageLocalpath);

    return res.status(400).json({
      message: "User with this email or username already exists",
    });
  }

  // handle images

  // check for avatar (mandatory)
  if (!avatarLocalPath) {
    if (coverImageLocalpath) fs.unlinkSync(coverImageLocalpath);

    return res.status(400).json({
      message: "Avatar is required",
    });
  }

  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  // create user
  try {
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

export { registerUser, loginUser };
