# Module: utils.ts

This module provides miscellaneous utility functions that are used across the instrumentation package.

## `generateUuid()`

-   **Returns**: A new version 4 UUID (Universally Unique Identifier) string.
-   **Usage**: This is used to generate unique IDs for requests (`mcp.request.id`) and sessions (`mcp.session.id`).
-   **Dependencies**: Uses the `uuid` library.

## `getRuntimeInfo()`

-   **Returns**: An object containing the IP address and port of the running process.
    -   `{ address: string, port: string | undefined }`
-   **Usage**: This is used to get the client address and port for span attributes, providing information about the server's environment.
-   **Process**:
    1.  Reads the `PORT` environment variable.
    2.  Uses the `os.networkInterfaces()` method from Node.js to find the first non-internal IPv4 address of the machine.
-   **Dependencies**: Uses the `os` module from Node.js.
