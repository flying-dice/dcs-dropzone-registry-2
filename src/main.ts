import "./api/auth.ts";
import "./api/user-mods.ts";
import "./api/mods.ts";
import { app } from "./app.ts";

Deno.serve(app.fetch);
