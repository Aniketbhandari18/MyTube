import { Router } from "express";
import { getSearchResults, getSearchSuggestions } from "../controllers/search.controller.js";

const router = Router();

router.route("/results").get(getSearchResults);
router.route("/suggestions").get(getSearchSuggestions);

export default router;