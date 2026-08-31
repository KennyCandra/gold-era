import express from 'express';

const app = express();

app.get("/health" , (_req : express.Request , res: express.Response) => {
    res.json({message: "hello"})
})


app.listen(3000 , () => {
    console.log("listening to port 3000")
})