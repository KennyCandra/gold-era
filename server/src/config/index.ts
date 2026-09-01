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
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailPass: process.env.GMAIL_PASS ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  maxFilesPerUpload: Number(process.env.MAX_FILES_PER_UPLOAD) || 10,
} as const;
