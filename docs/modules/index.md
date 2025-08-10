# Module: index.ts

This module serves as the main entry point for the `@shinzolabs/instrumentation-mcp` package. It exports the primary `instrumentServer` function, as well as other key classes and types.

## `instrumentServer(server, config)`

This is the main function to enable observability on an MCP server.

-   **`server`**: An instance of `McpServer` from `@modelcontextprotocol/sdk`.
-   **`config`**: A `TelemetryConfig` object for configuration.

**Returns**: An `ObservabilityInstance` object, which provides methods to interact with the telemetry system (e.g., creating custom spans, getting metrics).

### Process:

1.  Initializes a `TelemetryManager` with the provided configuration.
2.  Creates an `McpServerInstrumentation` instance, passing the server and the telemetry manager.
3.  Calls the `.instrument()` method on the instrumentation instance to wrap the server's methods.
4.  Returns an object with methods for manual telemetry interaction.

## Other Exports

-   **`TelemetryManager`**: The class that manages the OpenTelemetry SDK. See [`telemetry.md`](./telemetry.md) for details.
-   **`PIISanitizer`**: The class responsible for redacting sensitive data. See [`sanitizer.md`](./sanitizer.md) for details.
-   **`ConfigValidator`**: The class used to validate the `TelemetryConfig` object. See [`config.md`](./config.md) for details.
-   **Types**: Exports several TypeScript types, including `TelemetryConfig`, `AuthConfig`, and `ObservabilityInstance`. See [`types.md`](./types.md) for details.
