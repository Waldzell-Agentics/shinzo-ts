# High-ROI Investment Suggestions

This document outlines potential areas for improvement and new features for the Shinzo-TS repository. These suggestions are based on an analysis of the current codebase and are aimed at providing the highest return on investment in terms of functionality, usability, and completeness.

## 1. Complete MCP Server Instrumentation

**Priority**: High
**Area**: `packages/instrumentation-mcp/src/instrumentation.ts`

### Observation:

The current implementation only instruments the `server.tool()` method. All other MCP server methods (`completions`, `logs`, `notifications`, etc.) are placeholders with `// TODO` comments.

### Suggestion:

The highest-impact improvement would be to implement the instrumentation for all remaining MCP server methods. This would make the `instrumentation-mcp` package a complete, out-of-the-box observability solution for any MCP-compliant server.

### Implementation Steps:

-   For each method (e.g., `instrumentCompletions`), create a wrapper similar to `instrumentTools`.
-   Use the `createInstrumentedHandler` to wrap the method's callback, creating spans and recording metrics.
-   Ensure that relevant attributes are added to the spans for each method (e.g., `mcp.completion.id` for completions).

## 2. Expand Exporter Support

**Priority**: Medium
**Area**: `packages/instrumentation-mcp/src/telemetry.ts`

### Observation:

The current implementation supports OTLP/HTTP, OTLP/gRPC, and a console exporter.

### Suggestion:

While OTLP is the standard, adding support for other popular exporter formats directly could simplify integration for users who are not yet fully on the OpenTelemetry stack.

### Implementation Steps:

-   Add a `zipkin` exporter option to `TelemetryConfig`.
-   Conditionally import and instantiate the `ZipkinExporter` in `telemetry.ts`.
-   Add a `prometheus` exporter option, which would expose a `/metrics` endpoint on the server.

## 3. Enhance PII Sanitizer

**Priority**: Medium
**Area**: `packages/instrumentation-mcp/src/sanitizer.ts`

### Observation:

The `PIISanitizer` is robust, but its patterns and sensitive keys are hardcoded.

### Suggestion:

Allow users to extend the PII sanitizer with their own custom rules. This would provide more flexibility for domain-specific PII.

### Implementation Steps:

-   Add optional `piiPatterns: RegExp[]` and `sensitiveKeys: string[]` properties to `TelemetryConfig`.
-   In the `PIISanitizer` constructor, merge the user-provided patterns and keys with the default ones.

## 4. Create More Examples

**Priority**: Low
**Area**: `packages/instrumentation-mcp/examples/`

### Observation:

There is a single `basic-usage.ts` example.

### Suggestion:

Create more detailed examples demonstrating the advanced features of the library. This will lower the barrier to entry for new users and showcase the full power of the package.

### Example Ideas:

-   An example showing how to use a custom `dataProcessor`.
-   An example of setting up and using the `ObservabilityInstance` to create custom spans and metrics.
-   An example demonstrating bearer token authentication with a collector.
-   A full-stack example using Docker to run an instrumented server and an OpenTelemetry collector side-by-side.
