import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  editProfile,
  getUserProfileDetails,
  deleteUserProfile,
  verifyUser,
  requestPasswordReset,
  resetPassword,
  checkAuth,
  editPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { optionalAuth, verifyJWT, verifyVerificationToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify").post(verifyVerificationToken, verifyUser);
router.route("/forgot-password").post(requestPasswordReset);
router.route("/reset-password/:resetPasswordToken").post(resetPassword);

router.route("/login").post(loginUser);
router.route("/check-auth").get(verifyJWT, checkAuth);

router.route("/:channelIdentifier").get(optionalAuth, getUserProfileDetails);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
const print = (req, res, next) => {
  console.log("hit");
  next();
}
router.route("/edit-profile").patch(
  print,
  verifyJWT,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "cover-image",
      maxCount: 1,
    },
  ]),
  editProfile
);
router.route("/edit-password").patch(verifyJWT, editPassword);
router.route("/delete-profile").delete(verifyJWT, deleteUserProfile);


export default router;
