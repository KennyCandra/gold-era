import nodemailer from "nodemailer";
import { env } from "@/config";
import { OTP_TTL_MINUTES } from "./otp";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: env.gmailUser, pass: env.gmailPass },
});

const send = (to: string, subject: string, heading: string, code: string) =>
  transporter.sendMail({
    from: env.gmailUser,
    to,
    subject,
    text: `${heading}\n\nYour code is ${code}\nIt expires in ${OTP_TTL_MINUTES} minutes.`,
    html: `<p>${heading}</p><p style="font-size:24px;letter-spacing:4px"><b>${code}</b></p><p>It expires in ${OTP_TTL_MINUTES} minutes.</p>`,
  });

export const sendVerificationEmail = (to: string, code: string) =>
  send(to, "Verify your email", "Welcome — confirm your email address.", code);

export const sendPasswordResetEmail = (to: string, code: string) =>
  send(to, "Reset your password", "Use this code to reset your password.", code);
