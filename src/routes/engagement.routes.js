import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { handleEngagement } from "../controllers/engagement.controller.js";

const router = Router();

router.route("/handleEngagement/:videoId").post(verifyJWT, handleEngagement);

export default router;