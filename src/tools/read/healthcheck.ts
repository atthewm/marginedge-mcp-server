import { z } from "zod";
import type { ToolDefinition } from "../registry.js";
import { jsonResult } from "../registry.js";
import type { RestaurantUnitsResponse } from "../../models/index.js";

interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: Record<
    string,
    { status: "pass" | "fail"; message: string; durationMs?: number }
  >;
  config: {
    restaurantConfigured: boolean;
    restaurantId: number | null;
  };
}

export const healthcheckTool: ToolDefinition = {
  name: "marginedge_healthcheck",
  description:
    "Validate configuration, authentication, and core API connectivity " +
    "in one call. Returns a health status for each check.",
  inputSchema: z.object({}),
  async execute(_input, { client }) {
    const restaurantId = client.getRestaurantId();

    const status: HealthStatus = {
      overall: "healthy",
      checks: {},
      config: {
        restaurantConfigured: restaurantId !== undefined,
        restaurantId: restaurantId ?? null,
      },
    };

    // Check auth and API connectivity
    const authStart = Date.now();
    try {
      const data = await client.get<RestaurantUnitsResponse>("/restaurantUnits");
      const count = data.restaurants?.length ?? 0;
      status.checks.authentication = {
        status: "pass",
        message: `Successfully authenticated. ${count} restaurant(s) accessible.`,
        durationMs: Date.now() - authStart,
      };
    } catch (error) {
      status.checks.authentication = {
        status: "fail",
        message: error instanceof Error ? error.message : "Auth check failed",
        durationMs: Date.now() - authStart,
      };
      status.overall = "unhealthy";
    }

    // Check restaurant config
    if (!restaurantId) {
      status.checks.restaurantConfig = {
        status: "fail",
        message: "No MARGINEDGE_RESTAURANT_ID configured",
      };
      status.overall =
        status.overall === "unhealthy" ? "unhealthy" : "degraded";
    } else {
      status.checks.restaurantConfig = {
        status: "pass",
        message: `Restaurant ID ${restaurantId} configured`,
      };
    }

    // Check data connectivity with a lightweight call
    if (restaurantId && status.checks.authentication?.status === "pass") {
      const apiStart = Date.now();
      try {
        await client.get("/categories", { restaurantUnitId: restaurantId });
        status.checks.dataConnectivity = {
          status: "pass",
          message: "Successfully retrieved data from MarginEdge API",
          durationMs: Date.now() - apiStart,
        };
      } catch (error) {
        status.checks.dataConnectivity = {
          status: "fail",
          message:
            error instanceof Error
              ? error.message
              : "Data connectivity check failed",
          durationMs: Date.now() - apiStart,
        };
        status.overall =
          status.overall === "unhealthy" ? "unhealthy" : "degraded";
      }
    }

    return jsonResult(status);
  },
};
