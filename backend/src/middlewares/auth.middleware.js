import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized request: Missing token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    
    // check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "User is not verified. Please verify your email first.",
      });
    }

    // add user in req object
    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Invalid Access Token",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (user?.isVerified){
      req.user = user;
      return next();
    }

  } catch (error) {
    console.log(error);
    next();
  }
};

export const verifyVerificationToken = async (req, res, next) =>{
  try {
    const token = req.cookies?.verificationToken || req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized request: Missing token",
      });
    }

    const decodedToken = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    
    // add user in req object
    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Invalid Access Token",
    });
  }
};