import z from "zod";

export interface RequestLike {
  header(name: string): string | undefined;
}

/**
 * A Zod schema to validate and transform the Bearer token from the authorization header.
 * It ensures the header starts with "Bearer " and then removes this prefix.
 */
const bearerHeader = z.string().regex(/^Bearer .+$/).transform((v) => v.replace("Bearer ", ""));

/**
 * Extracts and returns the Bearer token from the authorization header of the request.
 *
 * @param {RequestLike} req - The request object containing a function to get header value.
 * @returns {string} - The Bearer token extracted from the authorization header.
 * @throws {Error} - If the authorization header is missing or does not match the expected format.
 */
export function getBearerToken(req: RequestLike): string {
  return bearerHeader.parse(req.header("authorization") || req.header("Authorization"));
}
