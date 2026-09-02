import bcrypt from "bcryptjs";
import UserRepository from "@/reposatories/user";
import { AppError } from "@/lib/AppError";
import { generateTokens } from "@/lib/jwt";
import { UserCreateInput } from "@/generated/prisma/models";
import { userWithoutPassword } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { VerificationType } from "@/generated/prisma/enums";
import VerificationCodeRepository from "@/reposatories/verificationCode";
import { generateCode, hashCode, codeExpiry } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

class authController {
    static async login(email : string , password: string){
        const user = await UserRepository.findByEmail(email);

        if (!user){
            throw new AppError(401 , "Invalid email or password")
        }

        const isMatch = await bcrypt.compare(password , user.password);

        if (!isMatch){
            throw new AppError(401 , "Invalid email or password")
        }

        const tokens = generateTokens({ userId: user.id })
        const userWithoutPw = userWithoutPassword(user);

        return {
            user : userWithoutPw,
            accessToken : tokens.accessToken,
            refreshToken : tokens.refreshToken
        }

    }

    static async register(email : string , name : string ,password : string){
        const hasedPassword = await bcrypt.hash(password , 12);
        const code = generateCode();

        const userData : UserCreateInput= {
            name ,
            email,
            password : hasedPassword,
        }

        const newUser = await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({ data: userData });

            await VerificationCodeRepository.create({
                userId: created.id,
                type: VerificationType.EMAIL_VERIFICATION,
                code: await hashCode(code),
                expiresAt: codeExpiry(),
            }, tx);

            return created;
        });

        try {
            await sendVerificationEmail(newUser.email, code);
        } catch (err) {
            console.error("register: sendVerificationEmail failed", { userId: newUser.id, email: newUser.email, err });
        }

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


    static async changePassword(userId : string , currentPassword : string , newPassword : string){
        const user = await UserRepository.findById(userId);

        if (!user){
            throw new AppError(404 , "user not found")
        }

        const isMatch = await bcrypt.compare(currentPassword , user.password);

        if (!isMatch){
            throw new AppError(400 , "Current password is incorrect")
        }

        const hashedPassword = await bcrypt.hash(newPassword , 12);
        await UserRepository.updatePassword(user.id , hashedPassword);

        return { message: "Password updated" }
    }


    static async refresh(userId : string){
        const user = await UserRepository.findById(userId);

        if (!user){
            throw new AppError(401 , "Not Authorized")
        }

        const tokens = generateTokens({ userId: user.id });
        const userwithoutPw = userWithoutPassword(user);


        return {
            user : userwithoutPw,
            accessToken : tokens.accessToken,
            refreshToken : tokens.refreshToken
        }
    }
}


export default authController