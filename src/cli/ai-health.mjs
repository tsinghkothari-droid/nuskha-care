import { runAiHealthCheck } from "../ai/provider.mjs";

try {
  const result = await runAiHealthCheck();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
} catch (error) {
  console.error(error?.stack || error);
  process.exitCode = 1;
}

