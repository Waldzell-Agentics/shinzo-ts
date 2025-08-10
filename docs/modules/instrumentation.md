# Module: instrumentation.ts

This module contains the `McpServerInstrumentation` class, which is responsible for the "automatic instrumentation" of the `McpServer` instance. It works by wrapping, or "patching," the server's methods to capture telemetry data.

## `McpServerInstrumentation`

This class is instantiated in the `instrumentServer` function and is where the instrumentation logic resides.

### Constructor(`server`, `telemetryManager`)

-   Takes an `McpServer` instance and a `TelemetryManager` instance as arguments.

### `instrument()`

This is the main method that applies the instrumentation. It checks if the server has already been instrumented and then calls private methods to wrap the various server functionalities.

**Note:** Currently, only the `tool` method is fully instrumented. Other methods are placeholders for future implementation.

### Key Methods

-   **`instrumentTools()`**: This private method wraps the `server.tool()` method.
    -   It saves a reference to the original `tool` method.
    -   It replaces `server.tool` with a new function that intercepts the arguments.
    -   The final argument (the callback handler) is wrapped with the `createInstrumentedHandler` method before being passed to the original `tool` method.

-   **`createInstrumentedHandler(originalHandler, method, name)`**: This is the core of the instrumentation logic. It returns a new, asynchronous function that wraps the original tool handler. This new function performs the following steps:
    1.  Creates base attributes for the telemetry data, including the method and tool name.
    2.  Gets a histogram and a counter from the `TelemetryManager`.
    3.  When called, it starts a new active span with a unique request ID and other attributes.
    4.  Increments the tool call counter.
    5.  Calls the `originalHandler` within a `try...catch` block to capture the result or any errors.
    6.  Sets the span status to `OK` or `ERROR` based on the outcome.
    7.  Calculates the duration of the handler's execution.
    8.  Records the duration in the histogram.
    9.  Ends the span.
    10. Throws the error if one was caught, otherwise returns the result.
