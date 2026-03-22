import { logger, ApiRequestError, AuthenticationError } from "../utils/index.js";
import type { Config } from "../config/index.js";

interface RequestOptions {
  method?: "GET";
  path: string;
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
}

/**
 * MarginEdge API client with authentication, retries, rate limiting, and error handling.
 * The MarginEdge API uses a static API key (no OAuth flow needed) and enforces
 * a rate limit of 1 request per second.
 */
export class MarginEdgeClient {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly defaultRestaurantId: number | undefined;
  private lastRequestTime = 0;
  private static MAX_RETRIES = 3;
  private static RETRY_BASE_MS = 1000;
  private static DEFAULT_TIMEOUT_MS = 30_000;
  private static RATE_LIMIT_MS = 1050; // 1 req/sec with small buffer

  constructor(config: Config) {
    this.apiKey = config.marginedgeApiKey;
    this.apiHost = config.marginedgeApiHost;
    this.defaultRestaurantId = config.marginedgeRestaurantId;
  }

  /**
   * Make an authenticated request to the MarginEdge API.
   * Automatically enforces 1 req/sec rate limit.
   */
  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const {
      method = "GET",
      path,
      params,
      timeoutMs = MarginEdgeClient.DEFAULT_TIMEOUT_MS,
    } = options;

    const url = this.buildUrl(path, params);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MarginEdgeClient.MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const delay =
          MarginEdgeClient.RETRY_BASE_MS * Math.pow(2, attempt - 1);
        logger.debug(`Retrying request (attempt ${attempt + 1})`, {
          delay,
          path,
        });
        await this.sleep(delay);
      }

      // Enforce rate limit
      await this.throttle();

      try {
        const headers: Record<string, string> = {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        };

        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          timeoutMs
        );

        let response: Response;
        try {
          response = await fetch(url, {
            method,
            headers,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }

        this.lastRequestTime = Date.now();

        if (response.status === 403) {
          throw new AuthenticationError(
            "MarginEdge API key is invalid or does not have access to this resource",
            { path, status: 403 }
          );
        }

        if (!response.ok) {
          const responseBody = await response.text().catch(() => "");
          throw new ApiRequestError(
            `MarginEdge API ${method} ${path} returned ${response.status}`,
            response.status,
            {
              path,
              status: response.status,
              body: responseBody.slice(0, 500),
            }
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Only retry on transient errors
        if (error instanceof ApiRequestError) {
          const status = error.statusCode ?? 0;
          if (status >= 500 || status === 429) {
            continue;
          }
          throw error;
        }

        if (error instanceof AuthenticationError) {
          throw error;
        }

        // Retry on network errors
        if (
          error instanceof TypeError ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          continue;
        }

        throw error;
      }
    }

    throw (
      lastError ??
      new ApiRequestError("Request failed after retries", 0)
    );
  }

  /**
   * Convenience method for GET requests.
   */
  async get<T = unknown>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>({ method: "GET", path, params });
  }

  /**
   * Fetch all pages of a paginated endpoint.
   * MarginEdge uses cursor based pagination with a nextPage token.
   */
  async getAllPages<T>(
    path: string,
    dataKey: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T[]> {
    const allItems: T[] = [];
    let nextPage: string | undefined;

    do {
      const queryParams = { ...params };
      if (nextPage) {
        queryParams.nextPage = nextPage;
      }

      const response = await this.get<Record<string, unknown>>(path, queryParams);
      const items = response[dataKey] as T[] | undefined;
      if (items && Array.isArray(items)) {
        allItems.push(...items);
      }

      nextPage = response.nextPage as string | undefined;
    } while (nextPage);

    return allItems;
  }

  /**
   * Verify that the API key works by calling the restaurantUnits endpoint.
   */
  async verifyAuth(): Promise<boolean> {
    try {
      await this.get("/restaurantUnits");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the configured restaurant unit ID.
   */
  getRestaurantId(): number | undefined {
    return this.defaultRestaurantId;
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    // Append path to the base URL (e.g., https://api.marginedge.com/public + /orders)
    const base = this.apiHost.endsWith("/")
      ? this.apiHost.slice(0, -1)
      : this.apiHost;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const fullUrl = `${base}${cleanPath}`;
    const url = new URL(fullUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Enforce rate limit of 1 request per second.
   */
  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < MarginEdgeClient.RATE_LIMIT_MS) {
      const wait = MarginEdgeClient.RATE_LIMIT_MS - elapsed;
      logger.debug(`Rate limiting: waiting ${wait}ms`);
      await this.sleep(wait);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
