import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

export const app = express();

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);
console.log("dirname", dirName);
console.log("fileName", fileName);

const tempDir = path.join(dirName, "../public/temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import engagementRouter from "./routes/engagement.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import commentRouter from "./routes/comment.routes.js";
import watchHistoryRouter from "./routes/watchHistory.routes.js";
import searchRouter from "./routes/search.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/engagement", engagementRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/watchHistory", watchHistoryRouter);
app.use("/api/v1/search", searchRouter);