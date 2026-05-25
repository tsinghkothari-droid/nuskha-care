import { config } from "../config.mjs";
import { putObject } from "../storage/object-storage.mjs";

export async function synthesizeVoice({ script, language = "hi" }) {
  if (config.ttsProvider === "sarvam") {
    return createStubVoice({ provider: "sarvam-pending", script, language });
  }

  if (config.ttsProvider === "bhashini") {
    return createStubVoice({ provider: "bhashini-pending", script, language });
  }

  return createStubVoice({ provider: "stub", script, language });
}

async function createStubVoice({ provider, script, language }) {
  const stored = await putObject({
    buffer: Buffer.from(`VOICE STUB\nlanguage=${language}\n${script}`),
    contentType: "audio/ogg",
    prefix: "voice-notes"
  });

  return {
    provider,
    language,
    script,
    mediaUrl: null,
    objectKey: stored.objectKey,
    contentType: stored.contentType
  };
}

