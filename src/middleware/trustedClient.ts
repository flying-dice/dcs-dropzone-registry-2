import { HTTPException } from "hono/http-exception";
import { config } from "../config.ts";
import { HTTP_STATUS_UNAUTHORIZED } from "../constants.ts";
import { createFactory } from "hono/factory";

const factory = createFactory();

export const trustedClient = () =>
  factory.createMiddleware(async (c, next) => {
    const client = c.req.header("x-trusted-client-token");

    if (client !== config.trustedClientToken) {
      throw new HTTPException(HTTP_STATUS_UNAUTHORIZED);
    }

    await next();
  });
