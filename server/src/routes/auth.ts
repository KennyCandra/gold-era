import { Router} from "express"
import type {Response , Request} from "express"
import authController from "../controllers/auth"
import verificationController from "../controllers/verification"
import { validate } from "@/middlewares/validate";
import { loginSchema, signUpSchema, verifyEmailSchema, resendCodeSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "@/schema/auth";
import { authMiddleware, refreshTokenMiddleware } from "@/middlewares/authMiddleware";
import { cookiesOptions } from "@/lib/cookies";

const router = Router();


router.post("/login" , validate(loginSchema), async (request : Request , res : Response) =>  {
    const {email , password} = request.body;

    const newResponse = await authController.login(email , password);
    const { refreshToken, ...body } = newResponse;
    res.cookie("refreshToken" , refreshToken , cookiesOptions)

    return res.status(200).json(body)
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


router.patch("/change-password" , authMiddleware , validate(changePasswordSchema) , async (request : Request , res : Response) => {
    const userId = request.user?.id;
    const {currentPassword , newPassword} = request.body;

    const result = await authController.changePassword(userId! , currentPassword , newPassword);

    return res.status(200).json(result)
});


router.get("/refresh" , refreshTokenMiddleware , async(req : Request , res: Response) =>{
    const userId = req.user?.id;

    const response = await authController.refresh(userId!);
    const { refreshToken, ...body } = response;
    res.cookie("refreshToken" , refreshToken , cookiesOptions)

    return res.status(200).json(body)
})



router.post("/verify-email" , validate(verifyEmailSchema) , async (request : Request , res : Response) => {
    const {email , code} = request.body;

    const result = await verificationController.verifyEmail(email , code);
    const { refreshToken, ...body } = result;
    res.cookie("refreshToken" , refreshToken , cookiesOptions)

    return res.status(200).json(body)
})


router.post("/resend-code" , validate(resendCodeSchema) , async (request : Request , res : Response) => {
    const {email} = request.body;

    const result = await verificationController.resendCode(email);

    return res.status(200).json(result)
})


router.post("/forgot-password" , validate(forgotPasswordSchema) , async (request : Request , res : Response) => {
    const {email} = request.body;

    const result = await verificationController.forgotPassword(email);

    return res.status(200).json(result)
})


router.post("/reset-password" , validate(resetPasswordSchema) , async (request : Request , res : Response) => {
    const {email , code , password} = request.body;

    const result = await verificationController.resetPassword(email , code , password);

    return res.status(200).json(result)
})


router.post("/logout" , async (request : Request , res : Response) => {
    const { maxAge, ...clearOptions } = cookiesOptions;
    res.clearCookie("refreshToken" , clearOptions)

    return res.status(200).json({message: "Logged out"})
})


export default router;