export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || "development",
  defaultLanguage: process.env.NUSKHA_DEFAULT_LANGUAGE || "hi",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8787}`
};

