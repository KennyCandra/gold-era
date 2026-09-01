import { Router} from "express"
import type {Response , Request} from "express"
import authController from "../controllers/auth"
import { validate } from "@/middlewares/validate";
import { loginSchema, signUpSchema } from "@/schema/auth";
import { authMiddleware, refreshTokenMiddleware } from "@/middlewares/authMiddleware";
import { cookiesOptions } from "@/lib/cookies";

const router = Router();


router.post("/login" , validate(loginSchema), async (request : Request , res : Response) =>  {
    const {email , password} = request.body;

    const newResponse = await authController.login(email , password);
    res.cookie("refreshToken" , newResponse.refreshToken , cookiesOptions)

    return res.status(200).json(newResponse)
})


router.post("/register" , validate(signUpSchema) , async (request : Request , res : Response ) => {
    const {email , password , name } = request.body;

    await authController.register(email , name , password);

    res.status(201).json({message: "user created succesfully"});
})


router.get("/profile", authMiddleware  , async (request , res) => {
    const userId = request.user?.id;
    const userData = await authController.fetchUserData(userId!);

    return res.status(200).json({user: userData})
});


router.get("/refresh" , refreshTokenMiddleware , async(req : Request , res: Response) =>{
    const userId = req.user?.id;

    const response = await authController.refresh(userId!);

    return res.status(200).json({response})
})



export default router;