import nodemailer from "nodemailer";
import { env } from "@/config";
import { OTP_TTL_MINUTES } from "./otp";

// Railway blocks outbound SMTP (25/465/587) on Free, Trial and Hobby plans, so
// SMTP cannot be the production transport. SendGrid and Brevo both send over
// 443, which is unaffected by that block.
//
// Providers are tried in order and the first success wins, because an API key
// being present does not mean the account can actually send - SendGrid answers
// a valid, mail.send-scoped key with 401 "Maximum credits exceeded" once its
// credits are gone. That failure is only visible at send time, so the fallback
// has to live here rather than in configuration.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: env.gmailUser, pass: env.gmailPass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

type Message = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type Provider = {
  name: string;
  enabled: boolean;
  send: (message: Message) => Promise<unknown>;
};

const sendViaSendGrid = async ({ to, subject, text, html }: Message) => {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: env.mailFrom },
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  // SendGrid answers 202 with an empty body on success; anything else carries a
  // JSON error worth surfacing, since the caller only logs what it is given.
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SendGrid responded ${response.status}: ${detail.slice(0, 300)}`);
  }
};

const sendViaBrevo = async ({ to, subject, text, html }: Message) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.brevoApiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: env.mailFrom },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  // Brevo answers 201 with a messageId on success.
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo responded ${response.status}: ${detail.slice(0, 300)}`);
  }
};

// Brevo's relay also answers on 2525, which is outside Railway's blocked set
// (25/465/587). Kept as a third way out, behind the HTTPS call: an open port is
// an observation about today's platform, not a guarantee.
const brevoRelay = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: { user: env.brevoSmtpUser, pass: env.brevoSmtpPass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendViaBrevoRelay = ({ to, subject, text, html }: Message) =>
  brevoRelay.sendMail({ from: env.mailFrom, to, subject, text, html });

const sendViaGmail = ({ to, subject, text, html }: Message) =>
  transporter.sendMail({ from: env.gmailUser, to, subject, text, html });

// Ordered by confirmed reliability, not preference. Brevo's HTTPS API is the
// only transport verified to work from Railway, so it leads; SendGrid sits
// behind it because a valid key there still 401s on exhausted credits, and
// Gmail is last because its SMTP port is blocked in production entirely.
const providers: Provider[] = [
  { name: "brevo", enabled: Boolean(env.brevoApiKey), send: sendViaBrevo },
  { name: "brevo-relay-2525", enabled: Boolean(env.brevoSmtpUser && env.brevoSmtpPass), send: sendViaBrevoRelay },
  { name: "sendgrid", enabled: Boolean(env.sendgridApiKey), send: sendViaSendGrid },
  { name: "gmail", enabled: Boolean(env.gmailUser && env.gmailPass), send: sendViaGmail },
];

const send = async (to: string, subject: string, heading: string, code: string) => {
  const message: Message = {
    to,
    subject,
    text: `${heading}\n\nYour code is ${code}\nIt expires in ${OTP_TTL_MINUTES} minutes.`,
    html: `<p>${heading}</p><p style="font-size:24px;letter-spacing:4px"><b>${code}</b></p><p>It expires in ${OTP_TTL_MINUTES} minutes.</p>`,
  };

  const available = providers.filter((provider) => provider.enabled);

  if (!available.length) {
    throw new Error("No email provider configured");
  }

  const failures: string[] = [];

  for (const provider of available) {
    try {
      await provider.send(message);
      return provider.name;
    } catch (err) {
      failures.push(`${provider.name}: ${(err as Error).message}`);
    }
  }

  throw new Error(`All email providers failed - ${failures.join(" | ")}`);
};

export const sendVerificationEmail = (to: string, code: string) =>
  send(to, "Verify your email", "Welcome — confirm your email address.", code);

export const sendPasswordResetEmail = (to: string, code: string) =>
  send(to, "Reset your password", "Use this code to reset your password.", code);
