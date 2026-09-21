import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NODE_ENV, PORT, WEB_ORIGIN } from "./env.js";
import { errorHandler } from "./lib/http.js";
import { api } from "./routes/index.js";

const here = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: NODE_ENV === "production" ? WEB_ORIGIN : true,
  }),
);

app.use("/api", api);

/**
 * In production the built web app is served from the same origin, so there is
 * one process to deploy and no CORS in play. In development Vite serves it and
 * proxies /api here instead.
 */
const webDist = resolve(here, "../../web/dist");
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(webDist, "index.html"));
  });
}

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Flow Group API listening on http://localhost:${PORT}`);
  if (existsSync(webDist)) console.log(`Serving the built web app from ${webDist}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
