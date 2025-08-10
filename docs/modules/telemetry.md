# Module: telemetry.ts

This is the core module for OpenTelemetry integration. It defines the `TelemetryManager` class, which is responsible for setting up and managing the entire telemetry pipeline.

## `TelemetryManager`

This class is instantiated by the `instrumentServer` function and handles all aspects of telemetry data collection and exporting.

### Constructor(`config`)

-   Validates the `TelemetryConfig` using `ConfigValidator`.
-   Merges the user's configuration with the `DEFAULT_CONFIG`.
-   Initializes the PII sanitizer if enabled.
-   Configures and starts the OpenTelemetry `NodeSDK`. This involves:
    -   Creating a `Resource` with service name, version, and a unique session ID.
    -   Setting up resource detectors (host, OS, etc.).
    -   Configuring a trace exporter (`OTLPTraceExporter` or `ConsoleSpanExporter`).
    -   Setting up a trace sampler (`TraceIdRatioBasedSampler`).
    -   Configuring a metric reader (`PeriodicExportingMetricReader`) with an `OTLPMetricExporter`.
-   Gets `Tracer` and `Meter` instances from the OpenTelemetry API.

### Key Methods

-   **`startActiveSpan(name, attributes, fn)`**: A wrapper around the OpenTelemetry `tracer.startActiveSpan` method. It automatically adds the session ID and processes attributes before creating the span.
-   **`getHistogram(name, options)`**: Returns a function that can be used to record values in a histogram. The returned function also processes attributes automatically.
-   **`getIncrementCounter(name, options)`**: Returns a function that can be used to increment a counter metric.
-   **`getArgumentAttributes(params, prefix)`**: Flattens and collects tool arguments into a record of attributes if `enableArgumentCollection` is true.
-   **`processTelemetryAttributes(data)`**: Applies custom data processors and the PII sanitizer to a set of attributes.
-   **`shutdown()`**: Records the session duration metric and shuts down the OpenTelemetry SDK, ensuring all buffered telemetry is exported.

### Private Methods

-   **`getOTLPHeaders()`**: Constructs authentication headers for the OTLP exporter based on the `exporterAuth` configuration.
-   **`createTraceExporter()`**: Creates the appropriate trace exporter based on the `exporterType`.
-   **`createMetricReader()`**: Creates the appropriate metric reader based on the `exporterType`.
