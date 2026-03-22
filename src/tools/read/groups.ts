import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { GroupsResponse, GroupCategoriesResponse } from "../../models/index.js";

export const listGroupsTool: ToolDefinition = {
  name: "marginedge_list_groups",
  description:
    "List restaurant unit groups. Groups organize multiple restaurant units " +
    "together. Returns group name, member units, and category info.",
  inputSchema: z.object({
    conceptId: z
      .string()
      .optional()
      .describe("Optional concept ID to filter groups."),
    companyId: z
      .string()
      .optional()
      .describe("Optional company ID to filter groups."),
  }),
  async execute(input, { client }) {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (input.conceptId) params.conceptId = input.conceptId;
    if (input.companyId) params.companyId = input.companyId;

    const data = await client.get<GroupsResponse>(
      "/restaurantUnits/groups",
      Object.keys(params).length > 0 ? params : undefined
    );

    return jsonResult({
      count: data.groups?.length ?? 0,
      groups: data.groups ?? [],
    });
  },
};

export const listGroupCategoriesTool: ToolDefinition = {
  name: "marginedge_list_group_categories",
  description:
    "List group categories. Group categories organize restaurant groups " +
    "into higher level classifications.",
  inputSchema: z.object({
    conceptId: z
      .string()
      .optional()
      .describe("Optional concept ID to filter categories."),
    companyId: z
      .string()
      .optional()
      .describe("Optional company ID to filter categories."),
  }),
  async execute(input, { client }) {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (input.conceptId) params.conceptId = input.conceptId;
    if (input.companyId) params.companyId = input.companyId;

    const data = await client.get<GroupCategoriesResponse>(
      "/restaurantUnits/groupCategories",
      Object.keys(params).length > 0 ? params : undefined
    );

    return jsonResult({
      count: data.groupCategories?.length ?? 0,
      groupCategories: data.groupCategories ?? [],
    });
  },
};
