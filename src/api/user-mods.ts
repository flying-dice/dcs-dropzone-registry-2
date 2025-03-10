import { createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { createModSchema, Mod, modSchema, modSummarySchema } from "../schemas.ts";
import { app, getAuthenticatedUserFromRequest, jsonContent } from "../app.ts";
import { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK, HTTP_STATUS_UNAUTHORIZED } from "../constants.ts";
import { modsCollection } from "../database.ts";
import { config } from "../config.ts";

const params = z.object({ id: z.string().openapi({ param: { name: "id", in: "path" }, example: "hot-loader" }) });

app.openapi(
  createRoute({
    method: "get",
    description:
      "Gets a mod by id, this is an authenticated route and requires a Bearer token, if the user is not a maintainer of the mod a 404 is returned",
    path: "/user-mods/{id}",
    operationId: "getUserMod",
    tags: ["User Mods"],
    security: [{ Bearer: [] }],
    request: { params },
    responses: {
      [HTTP_STATUS_OK]: jsonContent(modSchema, "The mod published by the authenticated user"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const user = await getAuthenticatedUserFromRequest(c.req);

    const mod = await modsCollection.findOne({ id, maintainers: user.userId });
    if (!mod) throw new HTTPException(HTTP_STATUS_NOT_FOUND);

    return c.json(modSchema.parse(mod));
  },
);

app.openapi(
  createRoute({
    method: "get",
    description:
      "Gets the mods published by the authenticated user, this is an authenticated route and requires a Bearer token",
    path: "/user-mods",
    operationId: "getUserMods",
    tags: ["User Mods"],
    security: [{ Bearer: [] }],
    responses: {
      [HTTP_STATUS_OK]: jsonContent(z.array(modSummarySchema), "The mods published by the authenticated user"),
    },
  }),
  async (c) => {
    const user = await getAuthenticatedUserFromRequest(c.req);

    const mods = await modsCollection.find({ maintainers: user.userId, deleted: false }, {
      projection: { content: 0, versions: 0 },
    })
      .toArray();

    return c.json(z.array(modSummarySchema).parse(mods));
  },
);

app.openapi(
  createRoute({
    method: "put",
    description: "Updates a mod in the registry, this is an authenticated route and requires a Bearer token",
    path: "/user-mods/{id}",
    operationId: "updateUserMod",
    tags: ["User Mods"],
    security: [{ Bearer: [] }],
    request: {
      params,
      body: jsonContent(modSchema, "The mod to update"),
    },
    responses: {
      [HTTP_STATUS_OK]: jsonContent(modSchema, "The submitted mod"),
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const update = c.req.valid("json");
    await getAuthenticatedUserFromRequest(c.req);

    await modsCollection.updateOne({ id }, { $set: update });

    const mod = await modsCollection.findOne({ id: update.id });

    return c.json(modSchema.parse(mod));
  },
);

app.openapi(
  createRoute({
    method: "post",
    description: "Adds a mod in the registry, this is an authenticated route and requires an api key",
    path: "/user-mods/",
    operationId: "addUserMod",
    tags: ["User Mods"],
    security: [{ ApiKey: [] }],
    request: {
      body: jsonContent(createModSchema, "The mod to create"),
      headers: z.object({
        "x-api-key": z.string().openapi({ param: { name: "x-api-key", in: "header" }, example: "secr3t" }),
      }),
    },
    responses: {
      [HTTP_STATUS_OK]: jsonContent(modSummarySchema, "The submitted mod"),
    },
  }),
  async (c) => {
    const apiKey = c.req.valid("header")["x-api-key"];

    if (!apiKey) throw new HTTPException(HTTP_STATUS_UNAUTHORIZED);
    if (!config.apiKeys) throw new HTTPException(HTTP_STATUS_UNAUTHORIZED);

    if (!config.apiKeys.includes(apiKey)) {
      throw new HTTPException(HTTP_STATUS_UNAUTHORIZED);
    }

    const create = c.req.valid("json");

    const _mod: Mod = modSchema.parse(create);

    await modsCollection.insertOne(_mod);

    const mod = await modsCollection.findOne({ id: _mod.id });

    return c.json(modSummarySchema.parse(mod));
  },
);
