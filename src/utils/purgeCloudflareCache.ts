import Cloudflare from "cloudflare";
import { CachePurgeParams } from "cloudflare/resources/cache/cache.d.ts";
import { config } from "../config.ts";

const cfClient = new Cloudflare({ apiToken: config.cloudflareApiToken });

export async function purgeCloudflareCache(modId?: string) {
  console.log("Purging cache for mod", modId);
  const purgeParams: CachePurgeParams.CachePurgeSingleFile = {
    files: ["https://dcs-dropzone.app/mods", `https://dcs-dropzone.app/mods/${modId}`],
  };
  await cfClient.cache.purge(purgeParams).then(
    () => console.log("Successfully purged cache for mod", modId),
  ).catch(console.error);
}
