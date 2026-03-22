import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { OrderDetail } from "../../models/index.js";

export const listOrdersTool: ToolDefinition = {
  name: "marginedge_list_orders",
  description:
    "List orders (invoices) within a date range. Returns key fields including " +
    "vendor, total, status, and invoice number. Supports pagination and " +
    "optional status filtering. Dates use YYYY-MM-DD format.",
  inputSchema: z.object({
    startDate: z
      .string()
      .describe("Start date in YYYY-MM-DD format (required)."),
    endDate: z
      .string()
      .describe("End date in YYYY-MM-DD format (required)."),
    orderStatus: z
      .string()
      .optional()
      .describe(
        "Filter by status. Valid values: PREPROCESSING, EDI_PENDING, " +
          "IMAGE_PENDING, INITIAL_REVIEW, RECONCILIATION, FINAL_REVIEW, " +
          "AM_REVIEW, PENDING_APPROVAL, CLOSED"
      ),
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
            text: "No restaurant unit ID provided and no default configured. Set MARGINEDGE_RESTAURANT_ID.",
          },
        ],
        isError: true,
      };
    }

    const params: Record<string, string | number | boolean | undefined> = {
      restaurantUnitId,
      startDate: input.startDate,
      endDate: input.endDate,
    };
    if (input.orderStatus) {
      params.orderStatus = input.orderStatus;
    }

    // Fetch all pages
    const allOrders = await client.getAllPages<Record<string, unknown>>(
      "/orders",
      "orders",
      params
    );

    // Compute summary
    let totalValue = 0;
    for (const o of allOrders) {
      totalValue += (o.orderTotal as number) ?? 0;
    }

    return jsonResult({
      count: allOrders.length,
      totalValue: Math.round(totalValue * 100) / 100,
      dateRange: { start: input.startDate, end: input.endDate },
      orders: allOrders,
    });
  },
};

export const getOrderTool: ToolDefinition = {
  name: "marginedge_get_order",
  description:
    "Get detailed information for a specific order by its ID. " +
    "Returns line items, charges, tax, attachments, and vendor info.",
  inputSchema: z.object({
    orderId: z.string().describe("The order ID to retrieve."),
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

    const order = await client.get<OrderDetail>(
      `/orders/${input.orderId}`,
      { restaurantUnitId }
    );

    return jsonResult(order);
  },
};
