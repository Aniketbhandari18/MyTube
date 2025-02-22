import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, handleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/c/:channelId").post(verifyJWT, handleSubscription);
router.route("/").get(verifyJWT, getSubscribedChannels);

export default router;