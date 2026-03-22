import { z } from "zod";

/**
 * Configuration schema for the MarginEdge MCP server.
 * Validates environment variables at startup with friendly error messages.
 */
export const ConfigSchema = z.object({
  // MarginEdge API credentials
  marginedgeApiKey: z.string().min(1, "MARGINEDGE_API_KEY is required"),

  // Restaurant configuration
  marginedgeRestaurantId: z.number().int().positive().optional(),

  // API host
  marginedgeApiHost: z
    .string()
    .url()
    .default("https://api.marginedge.com/public"),

  // Logging
  logLevel: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),

  // Transport mode
  transport: z
    .enum(["stdio", "http"])
    .default("stdio"),
  httpPort: z.number().int().positive().default(3001),
  httpHost: z.string().default("127.0.0.1"),

  // API key authentication for HTTP transport
  mcpApiKey: z.string().optional(),

  // Entra ID / OAuth authentication for HTTP transport
  entraIdTenantId: z.string().optional(),
  entraIdClientId: z.string().optional(),
  entraIdAudience: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
