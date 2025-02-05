import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, editProfile } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
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
  registerUser
);

router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/edit-profile").post(
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

export default router;
