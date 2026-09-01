import bcrypt from "bcryptjs";
import UserRepository from "@/reposatories/user";
import { AppError } from "@/lib/AppError";
import { generateTokens } from "@/lib/jwt";
import { UserCreateInput } from "@/generated/prisma/models";
import { userWithoutPassword } from "@/lib/data";

class authController {
    static async login(email : string , password: string){
        const user = await UserRepository.findByEmail(email);
        if (!user){
            throw new AppError(404 , "user not found")
        }

        const isMatch = await bcrypt.compare(password , user?.password || "");

        if (!isMatch){
            throw new AppError(401 , "wrong password")
        }

        const payload = {
            userId : user.id,
            role : user.role
        }

        const tokens = generateTokens(payload)
        const userWithoutPw = userWithoutPassword(user);

        return {
            user : userWithoutPw,
            acesssToken : tokens.accessToken,
            refreshToken : tokens.refreshToken
        }

    }

    static async register(email : string , name : string ,password : string){
        const hasedPassword = await bcrypt.hash(password , 12);

        const userData : UserCreateInput= {
            name ,
            email,
            password : hasedPassword,
        }
        const newUser = await UserRepository.create(userData);

        return {newUser}

    }

    static async fetchUserData(userId : string){
        const user = await UserRepository.findById(userId);

        if (!user){
            throw new AppError(404 , "user not found")
        }
        const safeUser = userWithoutPassword(user);
        return safeUser;
    }


    static async refresh(userId : string){
        const user = await UserRepository.findById(userId);

        if (!user){
            throw new AppError(403 , "Not Authorized")
        }

        const payload = {
            userId : user.id,
            role : user.role
        }
        
        const tokens = generateTokens(payload);
        const userwithoutPw = userWithoutPassword(user);


        return {
            user : userwithoutPw,
            accessToken : tokens.accessToken,
            refreshToken : tokens.refreshToken
        }
    }
}


export default authController