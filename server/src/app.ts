import "express-async-errors";
import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config";
import userRouter from "./routes/auth";
import fileRouter from "./routes/file";
import statsRouter from "./routes/stats";
import adminUserRouter from "./routes/user";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: env.clientUrl, credentials: true }));

app.use("/auth", userRouter);
app.use("/files", fileRouter);
app.use("/users", adminUserRouter);
app.use("/stats", statsRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ message: "hello" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

export default app;
