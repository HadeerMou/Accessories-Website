import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { Prisma } from "./generated/prisma/client.js";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { HttpError } from "./lib/http-error.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_request, response) => {
  response.json({ status: "ok", service: "aura-backend", docs: "/api/health" });
});

app.use("/api", apiRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "Request body contains invalid JSON" });
    return;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({ error: "A record with the same unique value already exists" });
      return;
    }
    if (error.code === "P2025") {
      response.status(404).json({ error: "Record not found" });
      return;
    }
    if (error.code === "P2003") {
      response.status(409).json({ error: "This record is referenced by another resource" });
      return;
    }
  }
  console.error(error);
  response.status(500).json({
    error: "Internal server error",
    ...(env.nodeEnv !== "production" && error instanceof Error ? { detail: error.message } : {}),
  });
};

app.use(errorHandler);
