import * as mongoose from "mongoose";
import { ModData } from "./schema.ts";

const MONGO_URI = Deno.env.get("MONGO_URI");

if (!MONGO_URI) {
  throw new Error("MONGO_URI is required");
}

await mongoose.connect(MONGO_URI);
console.log("MongoDB Connected");

Deno.serve(async (request) => {
  if (request.method === "GET") {
    const mods = await ModData.find().exec();

    return Response.json(mods);
  }

  return Response.error();
});
