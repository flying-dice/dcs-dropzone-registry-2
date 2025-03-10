import { z } from "zod";
import { OAuthApp, Octokit } from "octokit";
import { jwtVerify, SignJWT } from "jose";
import { config } from "./config.ts";

const encodedSecret = new TextEncoder().encode(config.jwtSecret);

const app = new OAuthApp({
  clientType: "oauth-app",
  clientId: config.ghClientId,
  clientSecret: config.ghClientSecret,
  redirectUrl: config.ghRedirectUri,
  allowSignup: true,
});

/**
 * Schema for a GitHub user.
 */
export const githubUserData = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string().url(),
  html_url: z.string().url(),
  name: z.string().nullable(),
});

/**
 * Type representing a GitHub user.
 */
export type GithubUser = z.infer<typeof githubUserData>;

/**
 * Fetches the authenticated user's information from GitHub using the provided token.
 *
 * @param {string} token - The GitHub authentication token.
 * @returns {Promise<GithubUser>} - A promise that resolves to the authenticated user's information.
 */
export async function getGithubUserFromGithubToken(token: string): Promise<GithubUser> {
  const kit = new Octokit({ auth: token });

  const { data } = await kit.rest.users.getAuthenticated();

  return githubUserData.parse(data);
}

/**
 * Generates a JWT token for the provided GitHub token. The token is signed using the JWT_SECRET environment variable.
 * The JWT token is used to authenticate the user with the application without having to pass the GitHub token or call GitHub APIs continuously which is slow and going to hit the rate limit.
 */
export async function getJwtTokenForGithubToken(githubToken: string): Promise<string> {
  const user = await getGithubUserFromGithubToken(githubToken);

  return new SignJWT(user).setProtectedHeader({ alg: "HS256" }).sign(encodedSecret);
}

/**
 * Fetches the GitHub user information from the provided JWT token.
 */
export async function getGithubUserFromJwt(token: string): Promise<GithubUser> {
  const { payload } = await jwtVerify(token, encodedSecret);

  return githubUserData.parse(payload);
}

export async function handleGithubCallback(code: string, state: string): Promise<string> {
  const auth = await app.createToken({ code, state });
  return getJwtTokenForGithubToken(auth.authentication.token);
}

export function getWebFlowAuthorizationUrl(): string {
  return app.getWebFlowAuthorizationUrl({}).url;
}
