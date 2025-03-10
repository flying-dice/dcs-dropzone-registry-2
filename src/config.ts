import z from "zod";

const configSchema = z.object({
  mongoUri: z.string().describe("The URI of the MongoDB instance"),
  database: z.string().optional().describe("The name of the database to use"),
  modCollection: z.string().describe("The name of the collection to use for mods"),
  jwtSecret: z.string().describe("The secret used to sign JWT tokens"),
  ghRedirectUri: z.string().url().describe("The URI to redirect to after GitHub authentication"),
  ghClientId: z.string().describe("The client id of the GitHub OAuth app"),
  ghClientSecret: z.string().describe("The client secret of the GitHub OAuth app"),
  apiKeys: z.array(z.string()).optional().describe("The list of API keys to use for authentication"),
});

export const config = configSchema.parse({
  mongoUri: Deno.env.get("MONGO_URI"),
  jwtSecret: Deno.env.get("JWT_SECRET"),
  apiKeys: Deno.env.get("API_KEYS")?.split(","),
  database: "dcs-dropzone-registry",
  modCollection: "mod",
  ghRedirectUri: Deno.env.get("GH_REDIRECT_URI"),
  ghClientId: Deno.env.get("GH_CLIENT_ID"),
  ghClientSecret: Deno.env.get("GH_CLIENT_SECRET"),
});
