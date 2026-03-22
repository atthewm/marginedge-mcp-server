import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ConfigSchema, type Config } from "./schema.js";

/**
 * Parse a simple .env file into key=value pairs.
 * Does not override existing environment variables.
 */
function loadDotEnv(path: string): void {
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

/**
 * Load and validate configuration from environment variables.
 * Loads .env file if present. Returns validated config or throws with
 * a human readable error message.
 */
export function loadConfig(): Config {
  // Load .env file from project root
  loadDotEnv(resolve(process.cwd(), ".env"));

  const env = process.env;

  const raw = {
    marginedgeApiKey: env.MARGINEDGE_API_KEY ?? "",
    marginedgeRestaurantId: env.MARGINEDGE_RESTAURANT_ID
      ? parseInt(env.MARGINEDGE_RESTAURANT_ID, 10)
      : undefined,
    marginedgeApiHost: env.MARGINEDGE_API_HOST || "https://api.marginedge.com/public",
    logLevel: env.LOG_LEVEL || "info",
    transport: env.MCP_TRANSPORT || "stdio",
    httpPort: env.MCP_HTTP_PORT ? parseInt(env.MCP_HTTP_PORT, 10) : 3001,
    httpHost: env.MCP_HTTP_HOST || "127.0.0.1",
    mcpApiKey: env.MCP_API_KEY || undefined,
    entraIdTenantId: env.ENTRA_ID_TENANT_ID || undefined,
    entraIdClientId: env.ENTRA_ID_CLIENT_ID || undefined,
    entraIdAudience: env.ENTRA_ID_AUDIENCE || undefined,
  };

  const result = ConfigSchema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Configuration validation failed:\n${issues}\n\n` +
        `Hint: Copy .env.example to .env and fill in your MarginEdge API key.`
    );
  }

  return result.data;
}
