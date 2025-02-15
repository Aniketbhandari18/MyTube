import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, editComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/:commentId").post(verifyJWT, addComment);
router.route("/edit/:commentId").patch(verifyJWT, editComment);

export default router;