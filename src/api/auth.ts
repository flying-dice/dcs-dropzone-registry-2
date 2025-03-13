import { createRoute, z } from "@hono/zod-openapi";
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_OK } from "../constants.ts";
import { app } from "../app.ts";
import { githubAuthService } from "../services/github-auth.service.ts";
import { AuthService } from "../services/auth.service.ts";

enum AuthServices {
  Github = "github",
}

const authServices: Record<AuthServices, AuthService> = {
  [AuthServices.Github]: githubAuthService,
};

const params = z.object({
  provider: z.nativeEnum(AuthServices).openapi({
    param: { name: "provider", in: "path" },
    example: AuthServices.Github,
  }),
});

app.openapi(
  createRoute({
    method: "get",
    path: "/auth/{provider}/callback",
    tags: ["Auth"],
    request: {
      params,
      query: z.object({
        code: z.string().openapi({ param: { name: "code", in: "query" } }),
        state: z.string().openapi({ param: { name: "state", in: "query" } }),
      }),
    },
    responses: {
      [HTTP_STATUS_OK]: {
        description: "Redirects the browser to the callback URL with the JWT token and user information",
      },
      [HTTP_STATUS_BAD_REQUEST]: {
        description: "The provider is not supported",
      },
    },
  }),
  async (c) => {
    const provider = c.req.valid("param").provider;
    const authService = authServices[provider];

    const { token, user } = await authService.handleCallback(c.req.valid("query").code, c.req.valid("query").state);

    const searchParams = new URLSearchParams({ token, ...user });

    user.userName && searchParams.set("userName", user.userName);

    return c.redirect("https://localhost/dropzone-registry/callback?" + searchParams.toString());
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/auth/{provider}/login",
    tags: ["Auth"],
    request: { params },
    responses: {
      [HTTP_STATUS_OK]: {
        description: "Redirects the user to the OAuth provider login page",
      },
      [HTTP_STATUS_BAD_REQUEST]: {
        description: "The provider is not supported",
      },
    },
  }),
  (c) => {
    const provider = c.req.valid("param").provider;
    const authService = authServices[provider];

    return c.redirect(authService.getWebFlowAuthorizationUrl());
  },
);
