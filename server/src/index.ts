import dotenv from "dotenv";
dotenv.config()
import express from 'express';
import type {Request , Response} from "express"
import userRouter from "./routes/auth"

const app = express();
app.use(express.json())

const port = process.env.PORT;

app.use("/auth", userRouter)

app.get("/health" , (_req : Request , res: Response) => {
    res.json({message: "hello"})
});


app.listen(port , () => {
    console.log("listening to port" , port)
});