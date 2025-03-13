import { expect } from "@std/expect";
import { jsonContent } from "./jsonContent.ts";
import { z } from "zod";

Deno.test("returns correct JSON content object with valid schema and description", () => {
  const schema = z.object({ name: z.string() });
  const description = "A valid schema";
  const result = jsonContent(schema, description);
  expect(result).toEqual({
    content: { "application/json": { schema } },
    description,
  });
});
