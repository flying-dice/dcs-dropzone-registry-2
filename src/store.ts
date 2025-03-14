import { config } from "./config.ts";

export const kvStore = await Deno.openKv(config.kvUri);
