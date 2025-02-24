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
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyVerificationToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/verify").post(verifyVerificationToken, verifyUser);
router.route("/forgot-password").post(requestPasswordReset);
router.route("/reset-password/:resetPasswordToken").post(resetPassword);

router.route("/login").post(loginUser);

router.route("/:username").get(getUserProfileDetails);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/edit-profile").patch(
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
router.route("/delete-profile").delete(verifyJWT, deleteUserProfile);

export default router;
