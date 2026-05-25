export async function callOpenAiCompatibleChat({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature = 0.1,
  timeoutMs = 30000
}) {
  if (!baseUrl || !apiKey || !model) {
    throw new Error("missing_openai_compatible_config");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      }),
      signal: controller.signal
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`openai_compatible_error status=${response.status} body=${body.slice(0, 500)}`);
    }

    const parsed = JSON.parse(body);
    const content = parsed?.choices?.[0]?.message?.content || "";
    return {
      provider: "openai-compatible",
      model,
      content,
      raw: parsed
    };
  } finally {
    clearTimeout(timeout);
  }
}

