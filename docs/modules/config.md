# Module: config.ts

This module is responsible for handling the configuration of the telemetry system. It provides default values for the `TelemetryConfig` object and includes a validator to ensure that the user-provided configuration is valid.

## `DEFAULT_CONFIG`

A `Partial<TelemetryConfig>` object that contains the default settings for the instrumentation package. These defaults are applied to the user's configuration to ensure that all required settings are present.

### Default Values:

-   `samplingRate`: `1.0` (100%)
-   `metricExportIntervalMs`: `5000` (5 seconds)
-   `enablePIISanitization`: `true`
-   `enableArgumentCollection`: `false`
-   `exporterType`: `'otlp-http'`
-   `enableMetrics`: `true`
-   `enableTracing`: `true`
-   `batchTimeoutMs`: `2000` (2 seconds)
-   `dataProcessors`: `[]` (empty array)

## `ConfigValidator`

A class with a static `validate` method that checks the `TelemetryConfig` object for correctness.

### `validate(config)`

This method throws an error if the configuration is invalid. It performs the following checks:

-   Ensures `exporterEndpoint` is provided if the exporter is not `console`.
-   Validates that `samplingRate` is between 0 and 1.
-   Ensures `metricExportIntervalMs` is a positive number.
-   Ensures `batchTimeoutMs` is a non-negative number.
-   Calls a private method to validate the `exporterAuth` configuration based on its `type`.
