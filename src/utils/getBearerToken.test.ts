import { expect } from "@std/expect";
import { getBearerToken, RequestLike } from "./getBearerToken.ts";
import { ZodError } from "zod";

class MockRequest implements RequestLike {
  constructor(private readonly headers: Record<string, string>) {
    this.headers = headers;
  }

  header(name: string): string | undefined {
    return this.headers[name];
  }
}

Deno.test("returns the Bearer token when the authorization header is valid", () => {
  const req = new MockRequest({
    authorization: "Bearer validToken123",
  });
  const token = getBearerToken(req);
  expect(token).toBe("validToken123");
});

Deno.test("throws a ZodError when the authorization header is missing", () => {
  const req = new MockRequest({});
  expect(() => getBearerToken(req)).toThrow(ZodError);
});

Deno.test("throws a ZodError when the authorization header does not start with Bearer", () => {
  const req = new MockRequest({
    authorization: "InvalidToken123",
  });
  expect(() => getBearerToken(req)).toThrow(ZodError);
});

Deno.test("throws a ZodError when the authorization header is empty", () => {
  const req = new MockRequest({
    authorization: "Bearer ",
  });
  expect(() => getBearerToken(req)).toThrow(ZodError);
});
