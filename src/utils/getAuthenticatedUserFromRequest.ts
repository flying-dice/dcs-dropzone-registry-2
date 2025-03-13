import { UserData, userDataSchema } from "../services/auth.service.ts";
import { getBearerToken } from "./getBearerToken.ts";
import { config } from "../config.ts";
import { HTTP_STATUS_UNAUTHORIZED } from "../constants.ts";
import { HonoRequest } from "hono";
import { jwtVerify } from "jose";
import { HTTPException } from "hono/http-exception";

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
