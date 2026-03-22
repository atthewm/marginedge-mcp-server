import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { Vendor, VendorItem } from "../../models/index.js";

export const listVendorsTool: ToolDefinition = {
  name: "marginedge_list_vendors",
  description:
    "List all vendors for the restaurant. Returns vendor name, ID, " +
    "central vendor ID, and account numbers. Fetches all pages automatically.",
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

    const vendors = await client.getAllPages<Vendor>(
      "/vendors",
      "vendors",
      { restaurantUnitId }
    );

    return jsonResult({
      count: vendors.length,
      vendors,
    });
  },
};

export const listVendorItemsTool: ToolDefinition = {
  name: "marginedge_list_vendor_items",
  description:
    "List all items from a specific vendor. Returns vendor item codes, " +
    "product mappings, and central IDs. Fetches all pages automatically.",
  inputSchema: z.object({
    vendorId: z.string().describe("The vendor ID to list items for."),
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

    const items = await client.getAllPages<VendorItem>(
      `/vendors/${input.vendorId}/vendorItems`,
      "vendorItems",
      { restaurantUnitId }
    );

    return jsonResult({
      vendorId: input.vendorId,
      count: items.length,
      vendorItems: items,
    });
  },
};

export const getPackagingTool: ToolDefinition = {
  name: "marginedge_get_packaging",
  description:
    "Get packaging options for a specific vendor item. Returns packaging name, " +
    "unit of measure, and quantity per package.",
  inputSchema: z.object({
    vendorId: z.string().describe("The vendor ID."),
    vendorItemCode: z.string().describe("The vendor item code."),
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

    const packagings = await client.getAllPages<Record<string, unknown>>(
      `/vendors/${input.vendorId}/vendorItems/${input.vendorItemCode}/packaging`,
      "packagings",
      { restaurantUnitId }
    );

    return jsonResult({
      vendorId: input.vendorId,
      vendorItemCode: input.vendorItemCode,
      count: packagings.length,
      packagings,
    });
  },
};
