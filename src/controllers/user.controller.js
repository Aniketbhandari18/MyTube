import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = async (req, res) => {
  const { username, email, password, fullName } = req.body;

  // validation for empty fields
  if (
    !username?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !fullName?.trim()
  ) {
    return res.status(400).json({
      messgae: "All fields are required",
    });
  }

  // check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }], // checks by either username or email
  });

  if (existingUser) {
    return res.status(400).json({
      messgae: "User with this email or username already exists",
    });
  }

  // handle images
  if (!req.files.avatar) {
    return res.status(400).json({
      message: "Avatar is required",
    });
  }

  const avatarLocalPath = req.files.avatar?.[0]?.path;
  const coverImageLocalpath = req.files["cover-image"]?.[0]?.path;

  if (!avatarLocalPath) {
    return res.status(400).json({
      message: "Avatar is required",
    });
  }

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
    })

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    )

    return res.status(200).json({
      message: "User registers successfully",
      user: createdUser
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error registering user"
    })
  }
};

export { registerUser };
