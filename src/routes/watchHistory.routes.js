import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addVideoToWatchHistory } from "../controllers/watchHistrory.controller.js";


const router = Router();

router.route("/:videoId").post(verifyJWT, addVideoToWatchHistory);

export default router;