import dotenv from "dotenv";

dotenv.config();

const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "CLIENT_URL",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

export const env = {
  port: Number(process.env.PORT) || 8080,
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  clientUrl: process.env.CLIENT_URL!,
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminName: process.env.ADMIN_NAME ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailPass: process.env.GMAIL_PASS ?? "",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoSmtpUser: process.env.BREVO_SMTP_USER ?? "",
  brevoSmtpPass: process.env.BREVO_SMTP_PASS ?? "",
  mailFrom: process.env.MAIL_FROM ?? process.env.GMAIL_USER ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
} as const;
