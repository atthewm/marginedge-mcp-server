import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";

export const authStatusTool: ToolDefinition = {
  name: "marginedge_auth_status",
  description:
    "Verify MarginEdge API credentials and report connection status. " +
    "Returns whether authentication is successful, the API host, " +
    "and configured restaurant unit ID.",
  inputSchema: z.object({}),
  async execute(_input, { client, config }) {
    const authenticated = await client.verifyAuth();

    return jsonResult({
      authenticated,
      apiHost: config.marginedgeApiHost,
      configuredRestaurant: client.getRestaurantId() ?? null,
    });
  },
};
