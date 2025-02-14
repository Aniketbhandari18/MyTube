import express from "express";
import cookieParser from "cookie-parser";

export const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import engagementRouter from "./routes/engagement.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/engagement", engagementRouter);
app.use("/api/v1/subscription", subscriptionRouter);