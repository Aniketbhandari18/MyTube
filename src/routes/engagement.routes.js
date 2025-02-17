import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, handleEngagement } from "../controllers/engagement.controller.js";

const router = Router();

router.route("/handleEngagement/:videoId").post(verifyJWT, handleEngagement);
router.route("/").get(verifyJWT, getLikedVideos);

export default router;