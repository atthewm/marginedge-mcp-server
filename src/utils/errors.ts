/**
 * Base error class for MarginEdge MCP server errors.
 */
export class MarginEdgeMcpError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MarginEdgeMcpError";
  }
}

/**
 * Thrown when MarginEdge API authentication fails.
 */
export class AuthenticationError extends MarginEdgeMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "AUTH_ERROR", 403, details);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when a MarginEdge API request fails.
 */
export class ApiRequestError extends MarginEdgeMcpError {
  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message, "API_ERROR", statusCode, details);
    this.name = "ApiRequestError";
  }
}

/**
 * Thrown when required configuration is missing or invalid.
 */
export class ConfigError extends MarginEdgeMcpError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigError";
  }
}

/**
 * Thrown when input validation fails for a tool invocation.
 */
export class ValidationError extends MarginEdgeMcpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Format an error into a user friendly MCP tool response.
 */
export function formatErrorForTool(error: unknown): string {
  if (error instanceof MarginEdgeMcpError) {
    let msg = `Error [${error.code}]: ${error.message}`;
    if (error.details) {
      msg += `\nDetails: ${JSON.stringify(error.details, null, 2)}`;
    }
    return msg;
  }

  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
