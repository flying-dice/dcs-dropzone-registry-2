import mongoose from "mongoose";
const { Schema } = mongoose;

const indexDataSchema = new Schema({
  homepage: String,
  name: String,
  description: String,
  authors: [{
    _id: false,
    name: String,
    avatar: String,
    url: String,
  }],
  tags: [String],
  category: String,
  license: String,
  latest: String,
  dependencies: [String],
  versions: [{
    _id: false,
    releasepage: String,
    name: String,
    version: String,
    date: Date,
    exePath: String,
    assets: [{
      _id: false,
      remoteSource: String,
      links: [{
        _id: false,
        source: String,
        target: String,
        runonstart: {
          type: Boolean,
          default: false,
        },
      }],
    }],
  }],
});

export const ModData = mongoose.model("mod", indexDataSchema, "mod");
