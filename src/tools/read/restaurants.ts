import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { RestaurantUnitsResponse } from "../../models/index.js";

export const listRestaurantsTool: ToolDefinition = {
  name: "marginedge_list_restaurants",
  description:
    "List all restaurant units accessible to the configured API key. " +
    "Returns the name and numeric ID for each restaurant. " +
    "Use the ID in subsequent calls that require a restaurantUnitId.",
  inputSchema: z.object({}),
  async execute(_input, { client }) {
    const data = await client.get<RestaurantUnitsResponse>("/restaurantUnits");

    return jsonResult({
      count: data.restaurants?.length ?? 0,
      restaurants: data.restaurants ?? [],
    });
  },
};
