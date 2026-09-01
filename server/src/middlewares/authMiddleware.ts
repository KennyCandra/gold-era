import { AppError } from "@/lib/AppError";
import { verifyAccessToken, verifyRefreshToken } from "@/lib/jwt";
import type { Request , Response , NextFunction } from "express";
export function authMiddleware (request : Request , _response : Response , next : NextFunction) {
    const [scheme , accessToken] = (request.headers.authorization ?? "").split(" ");

    if (scheme !== "Bearer" || !accessToken){
        throw new AppError(401 , "Not Authorized")
    }

    const verfiedToken = verifyAccessToken(accessToken);

    if (!verfiedToken || !verfiedToken.role || !verfiedToken.userId){
        throw new AppError(401 , "Not Authorized")
    }

    request.user = {
        id : verfiedToken.userId,
        role : verfiedToken.role,
        verified : verfiedToken.verified ?? false
    }

    next()

}


export function refreshTokenMiddleware(req: Request , res : Response , next: NextFunction){
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken){
        throw new AppError(403 , "Not Authorized")
    }

    const verifiedToken = verifyRefreshToken(refreshToken);

    if (!verifiedToken || !verifiedToken.userId || !verifiedToken.role){
        throw new AppError(403 , "Not Authorized")
    }

    req.user = {
        id : verifiedToken.userId,
        role : verifiedToken.role,
        verified : verifiedToken.verified ?? false
    }


    next()
}

export function requireVerified(req: Request , _res : Response , next: NextFunction){
    if (!req.user){
        throw new AppError(401 , "Not Authorized")
    }

    if (!req.user.verified){
        throw new AppError(403 , "Email not verified")
    }

    next()
}
