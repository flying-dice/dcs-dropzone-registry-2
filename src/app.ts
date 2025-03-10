import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { jwtVerify } from "jose";
import { HonoRequest } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTP_STATUS_UNAUTHORIZED } from "./constants.ts";
import { config } from "./config.ts";
import { getBearerToken } from "./utils/getBearerToken.ts";
import { UserData, userDataSchema } from "./services/auth.service.ts";

export const app = new OpenAPIHono();
app.use("/*", cors());

/**
 * Creates a JSON content object for API responses.
 *
 * This function generates a content object with a specified JSON schema and description,
 * which can be used to define the structure and description of JSON responses in API documentation.
 */
export function jsonContent<T>(schema: T, description: string) {
  return { content: { "application/json": { schema } }, description };
}

/**
 * Extracts the authenticated user from the request.
 *
 * This function retrieves the bearer token from the request, decodes it to get the user information,
 * and returns the user data. If the token is invalid or missing, it throws an HTTP 401 Unauthorized exception.
 */
export async function getAuthenticatedUserFromRequest(request: HonoRequest): Promise<UserData> {
  try {
    const token = getBearerToken(request);
    const user = await jwtVerify(token, new TextEncoder().encode(config.jwtSecret));
    return userDataSchema.parse(user.payload);
  } catch (_e) {
    throw new HTTPException(HTTP_STATUS_UNAUTHORIZED);
  }
}
