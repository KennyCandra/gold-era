import { env } from "./config";
import 'express-async-errors';
import express from 'express';
import type {Request , Response} from "express"
import userRouter from "./routes/auth"
import fileRouter from "./routes/file"
import statsRouter from "./routes/stats"
import adminUserRouter from "./routes/user"
import { errorHandler } from "./middlewares/errorHandler"
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express();
app.use(express.json())
app.use(cookieParser())

const port = env.port;
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use("/auth", userRouter)
app.use("/files", fileRouter)
app.use("/users", adminUserRouter)
app.use("/stats", statsRouter)

app.get("/health" , (_req : Request , res: Response) => {
    res.json({message: "hello"})
});

app.use((_req : Request , res : Response) => {
    res.status(404).json({ success: false, message: "Not found" });
});

app.use(errorHandler);

app.listen(port , () => {
    console.log("listening to port" , port)
});