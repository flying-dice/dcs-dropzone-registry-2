import "./api/auth.ts";
import "./api/user-mods.ts";
import "./api/mods.ts";
import { app } from "./app.ts";

app.doc("/v3/api-docs", {
  openapi: "3.0.3",
  info: { title: "DCS Dropzone Registry", description: "DCS Dropzone Registry API", version: "1.0.0" },
});

Deno.serve(app.fetch);
