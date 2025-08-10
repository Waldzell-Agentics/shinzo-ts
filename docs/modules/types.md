# Module: types.ts

This module defines the core TypeScript interfaces used throughout the instrumentation package. These types provide strong typing for configuration and the public API.

## `TelemetryConfig`

This is the main configuration interface that users must provide when calling `instrumentServer`. It allows for detailed customization of the telemetry behavior.

### Key Properties:

-   **`serverName`**: `string` (Required) - The name of the server being instrumented.
-   **`serverVersion`**: `string` (Required) - The version of the server.
-   **`exporterEndpoint`**: `string` (Optional) - The OTLP exporter endpoint URL.
-   **`exporterAuth`**: `AuthConfig` (Optional) - Authentication details for the exporter.
-   **`samplingRate`**: `number` (Optional) - Trace sampling rate (0.0 to 1.0).
-   **`enablePIISanitization`**: `boolean` (Optional) - Whether to enable PII sanitization.
-   **`enableArgumentCollection`**: `boolean` (Optional) - Whether to collect tool arguments as span attributes.
-   **`dataProcessors`**: `((data: any) => any)[]` (Optional) - An array of custom functions to process telemetry data.
-   **`exporterType`**: `'otlp-http' | 'otlp-grpc' | 'console'` (Optional) - The type of exporter to use.
-   **`PIISanitizer`**: `PIISanitizer` (Optional) - A custom instance of the PII sanitizer.

## `AuthConfig`

An interface describing the authentication configuration for the OTLP exporter.

-   **`type`**: `'bearer' | 'apiKey' | 'basic'`
-   **`token`**: `string` (for bearer auth)
-   **`apiKey`**: `string` (for apiKey auth)
-   **`username` / `password`**: `string` (for basic auth)

## `ObservabilityInstance`

This interface defines the shape of the object returned by the `instrumentServer` function. It provides methods for interacting with the telemetry system after initialization.

### Methods:

-   **`startActiveSpan(...)`**: Manually start a new active span.
-   **`getHistogram(...)`**: Get a histogram metric recorder.
-   **`getIncrementCounter(...)`**: Get a counter metric recorder.
-   **`processTelemetryAttributes(...)`**: Manually process a set of attributes using the configured processors and sanitizer.
-   **`shutdown()`**: A function to gracefully shut down the telemetry system.
