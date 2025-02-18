import { Router } from "express";
import {
  publishVideo,
  updateVideo,
  incrementView,
  deleteVideo,
  getVideoById,
  searchResults,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/results").get(optionalAuth, searchResults);
router.route("/:videoId").get(optionalAuth, getVideoById);
router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
    {
      name: "video",
      maxCount: 1,
    },
  ]),
  publishVideo
);
router.route("/update/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);
router.route("/incrementView/:videoId").post(incrementView);

export default router;
