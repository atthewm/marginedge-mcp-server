import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { Product, Category } from "../../models/index.js";

export const listProductsTool: ToolDefinition = {
  name: "marginedge_list_products",
  description:
    "List all products for the restaurant. Returns product name, latest price, " +
    "reporting unit, tax exempt status, and category allocations. " +
    "Fetches all pages automatically.",
  inputSchema: z.object({
    restaurantUnitId: z
      .number()
      .optional()
      .describe("Restaurant unit ID. Uses configured default if not provided."),
  }),
  async execute(input, { client }) {
    const restaurantUnitId = input.restaurantUnitId ?? client.getRestaurantId();
    if (!restaurantUnitId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No restaurant unit ID provided and no default configured.",
          },
        ],
        isError: true,
      };
    }

    const products = await client.getAllPages<Product>(
      "/products",
      "products",
      { restaurantUnitId }
    );

    return jsonResult({
      count: products.length,
      products,
    });
  },
};

export const listCategoriesTool: ToolDefinition = {
  name: "marginedge_list_categories",
  description:
    "List all categories for the restaurant. Categories include Food, Beer, " +
    "Wine, Liquor, N/A Bev, Retail, Other, Labor, or custom types. " +
    "Each category has an accounting code.",
  inputSchema: z.object({
    restaurantUnitId: z
      .number()
      .optional()
      .describe("Restaurant unit ID. Uses configured default if not provided."),
  }),
  async execute(input, { client }) {
    const restaurantUnitId = input.restaurantUnitId ?? client.getRestaurantId();
    if (!restaurantUnitId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No restaurant unit ID provided and no default configured.",
          },
        ],
        isError: true,
      };
    }

    const categories = await client.getAllPages<Category>(
      "/categories",
      "categories",
      { restaurantUnitId }
    );

    return jsonResult({
      count: categories.length,
      categories,
    });
  },
};
