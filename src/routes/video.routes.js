import { Router } from "express";
import { videoPublish } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1
    },
    {
      name: "video",
      maxCount: 1
    }
  ]),
  videoPublish
);

export default router;