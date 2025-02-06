import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./utils/errorHandler.js";

export const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// import routes
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);


// handle error middleware
app.use("/", errorHandler);