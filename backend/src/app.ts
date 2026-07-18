import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { HttpError } from "./lib/http-error.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use("/api", apiRouter);

app.use((_request, response) => {
  response.status(404).json({ error: "Route not found" });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message });
    return;
  }
  console.error(error);
  response.status(500).json({
    error: "Internal server error",
    ...(env.nodeEnv !== "production" && error instanceof Error ? { detail: error.message } : {}),
  });
};

app.use(errorHandler);
