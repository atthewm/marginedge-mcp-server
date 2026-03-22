#!/usr/bin/env node

import { loadConfig } from "./config/index.js";
import { startServer } from "./mcp/index.js";
import { logger } from "./utils/index.js";

async function main(): Promise<void> {
  try {
    const config = loadConfig();
    logger.setLevel(config.logLevel);

    logger.info("MarginEdge MCP Server starting", {
      version: "0.1.0",
      apiHost: config.marginedgeApiHost,
      restaurant: config.marginedgeRestaurantId ?? "not configured",
    });

    await startServer(config);
  } catch (error) {
    process.stderr.write(
      `\nFailed to start MarginEdge MCP Server:\n${error instanceof Error ? error.message : String(error)}\n`
    );
    process.exit(1);
  }
}

main();
