import type { CookieOptions } from "express";
import { env } from "@/config";

export const  cookiesOptions : CookieOptions = {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    
}