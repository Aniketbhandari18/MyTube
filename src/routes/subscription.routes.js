import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { handleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/c/:channelId").post(verifyJWT, handleSubscription);

export default router;