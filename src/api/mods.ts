import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { app } from "../app.ts";
import { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } from "../constants.ts";
import { modSchema, modSummarySchema } from "../schemas.ts";
import { modsCollection } from "../database.ts";
import { jsonContent } from "../utils/jsonContent.ts";

const params = z.object({ id: z.string().openapi({ param: { name: "id", in: "path" }, example: "hot-loader" }) });

app.openapi(
  createRoute({
    method: "get",
    path: "/mods",
    operationId: "getMods",
    summary: "Retrieve Available Mods",
    description:
      "Fetches a list of all available mods excluding the Readme Content and Versions. This endpoint allows clients to retrieve a comprehensive list of mods that are currently available in the system. Each mod excludes the readme content and versions.",
    tags: ["Mods"],
    responses: {
      [HTTP_STATUS_OK]: jsonContent(z.array(modSummarySchema), "A list of available mods"),
    },
  }),
  async (c) => {
    const mods = await modsCollection.find({
      deleted: false,
      latest: {
        $exists: true,
      },
    }).project({ content: 0, versions: 0 }).toArray();
    return c.json(z.array(modSummarySchema).parse(mods));
  },
);

app.openapi(
  createRoute(
    {
      method: "get",
      path: "/mods/{id}",
      request: { params },
      operationId: "getModById",
      summary: "Retrieve a Specific Mod",
      description:
        "Fetches a specific mod by its id. This endpoint allows clients to retrieve a specific mod by providing the mod id. The response includes the full mod details including the readme content and versions.",
      tags: ["Mods"],
      responses: {
        [HTTP_STATUS_OK]: jsonContent(modSchema, "Retrieve a specific mod"),
      },
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const mod = await modsCollection.findOne({ id });
    if (!mod) throw new HTTPException(HTTP_STATUS_NOT_FOUND);
    return c.json(modSchema.parse(mod));
  },
);
