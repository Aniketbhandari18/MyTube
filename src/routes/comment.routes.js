import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, editComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/:commentId").post(verifyJWT, addComment);
router.route("/edit/:commentId").patch(verifyJWT, editComment);
router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

export default router;