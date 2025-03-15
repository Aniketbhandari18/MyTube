import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  editComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/:videoId").post(verifyJWT, addComment);
router.route("/:commentId").patch(verifyJWT, editComment);
router.route("/:commentId").delete(verifyJWT, deleteComment);
router.route("/:videoId").get(getVideoComments);

export default router;