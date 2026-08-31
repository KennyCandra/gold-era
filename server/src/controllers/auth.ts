import bcrypt from "bcryptjs";
import UserRepository from "@/reposatories/user";
import { AppError } from "@/lib/AppError";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { UserCreateInput } from "@/generated/prisma/models";

class authController {
    static async login(email : string , password: string){
        const user = await UserRepository.findByEmail(email);
        if (!user){
            throw new AppError(404 , "user not found")
        }

        const isMatch = bcrypt.compare(password , user?.password || "");

        if (!isMatch){
            throw new AppError(401 , "wrong password")
        }

        const payload = {
            userId : user.id,
            role : "user"
        }
        const acesssToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        return {
            user,
            acesssToken,
            refreshToken
        }

    }

    static async register(email : string , name : string ,password : string){
        const hasedPassword = await bcrypt.hash(password , 12);

        const userData : UserCreateInput= {
            name ,
            email,
            password : hasedPassword
        }
        const newUser = UserRepository.create(userData)

        return {
            newUser
        }
    }
}


export default authController