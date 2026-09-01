import { env } from "./config";
import 'express-async-errors';
import express from 'express';
import type {Request , Response} from "express"
import userRouter from "./routes/auth"
import { errorHandler } from "./middlewares/errorHandler"
import cookieParser from "cookie-parser"
import cors from "cors";

const app = express();
app.use(express.json())
app.use(cookieParser())

const port = env.port;
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use("/auth", userRouter)

app.get("/health" , (_req : Request , res: Response) => {
    res.json({message: "hello"})
});

app.use(errorHandler);

app.listen(port , () => {
    console.log("listening to port" , port)
});