import "dotenv/config";

const port = Number(process.env.PORT ?? 4000);
const nodeEnv = process.env.NODE_ENV ?? "development";
const authSecret = process.env.AUTH_SECRET?.trim() || "development-only-change-this-secret";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number");
}

if (nodeEnv === "production" && authSecret === "development-only-change-this-secret") {
  throw new Error("AUTH_SECRET is required in production");
}

export const env = {
  port,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL,
  authSecret,
  nodeEnv,
  smtp: {
    host: process.env.SMTP_HOST?.trim(),
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM?.trim() || "Aura Store <orders@aura.local>",
    adminEmail: process.env.ORDER_ADMIN_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim(),
  },
};
