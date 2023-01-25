import cors from "cors";

console.log("\nLaunching server...");

import os from "os";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import serveStatic from "serve-static";
import formData from "express-form-data";
import {
  addSentryPostHandler,
  addSentryPreHandler,
  initSentry,
} from "./sentry-setup";
import { createProxyMiddleware } from "http-proxy-middleware";

declare let global: {
  appRoot: string;
};
global.appRoot = path.join(__dirname, "../../");

import api from "./api";

const app = express();

initSentry();
addSentryPreHandler(app);

app.use(cors());
app.use(bodyParser.json({ limit: "64mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const out = path.join(__dirname, "../..", "out");

const formDataOptions = {
  uploadDir: os.tmpdir(),
};

app.use(formData.parse(formDataOptions));

app.use("/api", api);

// For local env (SM), all the requests are forwarded to the next dev server
// For production, all the requests are forwarded to the next build directory
if (process.env.ENV === "SM") {
  const NEXT_PORT = process.env.NEXT_PORT ?? "3000";
  const proxy = createProxyMiddleware({
    changeOrigin: true,
    target: `http://localhost:${NEXT_PORT}`,
    ws: true,
  });
  app.use(proxy);
} else {
  app.use(serveStatic(out));
}

app.use("/migration", (_, res) => {
  res.sendFile(path.join(out, "migration.html"));
});

app.use("/changelog", (_, res) => {
  res.sendFile(path.join(out, "changelog.html"));
});

app.use("/warnings", (_, res) => {
  res.sendFile(path.join(out, "warnings.html"));
});

app.use("/:lib/:sliceName/:variation/simulator", (_, res) => {
  res.sendFile(path.join(out, "[lib]/[sliceName]/[variation]/simulator.html"));
});

app.use("/:lib/:sliceName/:variation/screenshot", (_, res) => {
  res.sendFile(path.join(out, "[lib]/[sliceName]/[variation]/screenshot.html"));
});

app.use("/:lib/:sliceName/:variation", (_, res) => {
  res.sendFile(path.join(out, "[lib]/[sliceName]/[variation].html"));
});

app.use("/:cts/:id", (_, res) => {
  res.sendFile(path.join(out, "cts/[ct].html"));
});

app.use("/slices", (_, res) => {
  res.sendFile(path.join(out, "slices.html"));
});

app.use("/onboarding", (_, res) => {
  res.sendFile(path.join(out, "onboarding.html"));
});

app.use("/changes", (_, res) => {
  res.sendFile(path.join(out, "changes.html"));
});

const PORT = process.env.PORT || "9999";

addSentryPostHandler(app);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    // This is need becuase express middleware uses arguments.length
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).send(err.message || "Something broke!");
  }
);

app.listen(PORT, () => {
  const p = `http://localhost:${PORT}`;
  console.log(`Server running : ${p}`);
});

process.on("SIGINT", () => {
  console.log("\nServer killed manually. Exiting...");
  process.exit();
});
