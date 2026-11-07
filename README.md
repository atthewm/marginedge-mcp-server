# MarginEdge MCP Server

An MCP (Model Context Protocol) server for [MarginEdge](https://www.marginedge.com/), the restaurant back office platform. It gives AI assistants such as Claude Desktop and Claude Code read access to invoices, vendors, products and categories, so you can ask plain questions about food cost and purchasing.

Every tool is read only. The server never creates, edits or deletes anything in MarginEdge.

## Tools

| Tool | What it returns |
|------|-----------------|
| `marginedge_healthcheck` | Config, auth and API connectivity checks in one call |
| `marginedge_auth_status` | Whether the API key works and which host it hits |
| `marginedge_api_capabilities` | Which features are available with the current config |
| `marginedge_list_restaurants` | Restaurant units the API key can see |
| `marginedge_list_groups` | Restaurant unit groups |
| `marginedge_list_group_categories` | Categories for a group |
| `marginedge_list_orders` | Orders (invoices) in a date range, paginated |
| `marginedge_get_order` | One order with its line items |
| `marginedge_list_vendors` | Vendors with account numbers |
| `marginedge_list_vendor_items` | Items a vendor supplies |
| `marginedge_get_packaging` | Packaging detail for a vendor item |
| `marginedge_list_products` | Products with latest price and category allocations |
| `marginedge_list_categories` | Accounting categories |

## Setup

Requires Node 18 or later and a MarginEdge public API key.

```bash
npm install
cp .env.example .env
# set MARGINEDGE_API_KEY and, optionally, MARGINEDGE_RESTAURANT_ID
npm run build
```

### Use with Claude Desktop (stdio)

```json
{
  "mcpServers": {
    "marginedge": {
      "command": "node",
      "args": ["/path/to/marginedge-mcp-server/dist/index.js"],
      "env": {
        "MARGINEDGE_API_KEY": "your_api_key",
        "MARGINEDGE_RESTAURANT_ID": "123456"
      }
    }
  }
}
```

### Run over HTTP

Set `MCP_TRANSPORT=http`. The server listens on `127.0.0.1:3001` by default and exposes:

- `GET /health`: unauthenticated liveness check
- `/mcp`: Streamable HTTP MCP endpoint

Protect `/mcp` with `MCP_API_KEY`, or with Entra ID by setting `ENTRA_ID_TENANT_ID`, `ENTRA_ID_CLIENT_ID` and `ENTRA_ID_AUDIENCE`.

## Configuration

| Variable | Required | Default |
|----------|----------|---------|
| `MARGINEDGE_API_KEY` | Yes | |
| `MARGINEDGE_RESTAURANT_ID` | No | |
| `MARGINEDGE_API_HOST` | No | `https://api.marginedge.com/public` |
| `MCP_TRANSPORT` | No | `stdio` |
| `MCP_HTTP_PORT` | No | `3001` |
| `MCP_API_KEY` | No | |
| `LOG_LEVEL` | No | `info` |

## Related

- [toast-mcp-server](https://github.com/atthewm/toast-mcp-server): the same pattern for the Toast POS API.

## Development

```bash
npm run dev        # watch mode
npm run typecheck
npm test
```
