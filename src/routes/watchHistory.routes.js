import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToWatchHistory,
  getWatchHistory,
  removeVideoFromWatchHistory,
  clearWatchHistory,
} from "../controllers/watchHistrory.controller.js";

const router = Router();

router.route("/:videoId").post(verifyJWT, addVideoToWatchHistory);
router.route("/:watchHistoryId").delete(verifyJWT, removeVideoFromWatchHistory);
router.route("/clear").delete(verifyJWT, clearWatchHistory);
router.route("/").get(verifyJWT, getWatchHistory);

export default router;