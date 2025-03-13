import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { cache } from "hono/cache";
import { trustedClient } from "./middleware/trustedClient.ts";

export const app = new OpenAPIHono();
app.use(logger());
app.use("/*", cors());
app.use("/*", trustedClient());
app.use(
  "/mods/*",
  cache({
    cacheName: "dcs-dropzone",
    cacheControl: "public, max-age=86400, s-maxage=86400",
    wait: true,
  }),
);

app.doc("/v3/api-docs", {
  openapi: "3.0.3",
  info: { title: "DCS Dropzone Registry", description: "DCS Dropzone Registry API", version: "1.0.0" },
});
