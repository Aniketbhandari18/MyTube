import express from "express";

export const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// import routes
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);
