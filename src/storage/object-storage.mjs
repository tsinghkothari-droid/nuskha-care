import { createId } from "../store/ids.mjs";

export async function putObject({ buffer, contentType = "application/octet-stream", prefix = "local" }) {
  const objectKey = `${prefix}/${createId("obj")}`;
  return {
    provider: process.env.OBJECT_STORAGE_PROVIDER || "local-stub",
    objectKey,
    contentType,
    size: Buffer.byteLength(buffer || ""),
    private: true
  };
}

