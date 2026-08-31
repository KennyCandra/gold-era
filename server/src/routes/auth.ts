import {Router} from "express"
import type {Response , Request} from "express"
import authController from "../controllers/auth"

const router = Router();


router.post("/login" , (request : Request , response : Response) =>  {
    const {email , password} = request.body;

    if (!email || !password){
        return response.status(401).json({message: "not valid request"})
    }
    const newResponse = authController.login(email , password)

    return response.json(newResponse).status(200)
})


router.post("register" , (request : Request , response : Response ) => {
    const {email , password , name } = request.body;


    const user = authController.register(email , password, name);

    response.json({message: "user created succesfully"}).status(201);
})



export default router;