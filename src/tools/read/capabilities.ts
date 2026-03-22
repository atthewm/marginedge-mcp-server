import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";

export const capabilitiesTool: ToolDefinition = {
  name: "marginedge_api_capabilities",
  description:
    "Summarize which features are available based on current configuration " +
    "and credentials. Helps understand what operations the server can perform.",
  inputSchema: z.object({}),
  async execute(_input, { client, config }) {
    const authenticated = await client.verifyAuth();
    const restaurantId = client.getRestaurantId();

    return jsonResult({
      authentication: {
        configured: !!config.marginedgeApiKey,
        working: authenticated,
      },
      restaurant: {
        configured: restaurantId !== undefined,
        id: restaurantId ?? null,
      },
      availableOperations: {
        listRestaurants: authenticated,
        orders: authenticated && restaurantId !== undefined,
        orderDetails: authenticated && restaurantId !== undefined,
        products: authenticated && restaurantId !== undefined,
        categories: authenticated && restaurantId !== undefined,
        vendors: authenticated && restaurantId !== undefined,
        vendorItems: authenticated && restaurantId !== undefined,
        packaging: authenticated && restaurantId !== undefined,
        groups: authenticated,
        groupCategories: authenticated,
      },
      apiLimitations: [
        "MarginEdge public API is read only. No create, update, or delete operations.",
        "Rate limit: 1 request per second per API key.",
        "Pagination: 100 records per page, cursor based.",
        "Not available via API: inventory counts, food cost calculations, sales summaries, labor data, recipes, budget vs actual.",
      ],
    });
  },
};
