// TEMPORARY diagnostic - remove once the SMTP cause is confirmed.
// Reports whether Railway can reach Gmail's SMTP port. Sends no mail and
// returns no secret values, only whether they are present.
import { Router } from "express";
import type { Request, Response } from "express";
import nodemailer from "nodemailer";
import { env } from "@/config";

const router = Router();

router.get("/smtp", async (_request: Request, res: Response) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.gmailUser, pass: env.gmailPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const startedAt = Date.now();

  try {
    await transporter.verify();
    return res.json({
      ok: true,
      elapsedMs: Date.now() - startedAt,
      gmailUserSet: Boolean(env.gmailUser),
      gmailPassLength: env.gmailPass.length,
    });
  } catch (err) {
    const e = err as NodeJS.ErrnoException & { command?: string; responseCode?: number };
    return res.json({
      ok: false,
      elapsedMs: Date.now() - startedAt,
      gmailUserSet: Boolean(env.gmailUser),
      gmailPassLength: env.gmailPass.length,
      code: e.code,
      command: e.command,
      responseCode: e.responseCode,
      message: String(e.message).slice(0, 200),
    });
  }
});

export default router;
