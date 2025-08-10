# Module: sanitizer.ts

This module provides the `PIISanitizer` class, which is responsible for redacting Personally Identifiable Information (PII) from telemetry data to protect user privacy.

## `PIISanitizer`

This class is used by the `TelemetryManager` to sanitize attributes before they are exported. It can be extended or replaced by the user for custom sanitization logic.

### Constructor()

-   Initializes a set of regular expressions (`piiPatterns`) that match common PII formats like credit card numbers, Social Security Numbers, emails, and phone numbers.

### Key Methods

-   **`sanitize(data)`**: The main public method that takes a record of attributes and returns a sanitized version. It recursively traverses the object and sanitizes each value.

-   **`redactPIIAttributes()`**: This method returns an OpenTelemetry `DetectorSync`. This special type of detector is used during SDK initialization to automatically redact potentially sensitive resource attributes like IP and host names.

### Private Methods

-   **`sanitizeValue(value)`**: A helper method that checks the type of a value (string, object, array, etc.) and calls the appropriate sanitization function.

-   **`sanitizeString(str)`**: Iterates through the `piiPatterns` and replaces any matching substrings with `[REDACTED]`.

-   **`sanitizeObject(obj)`**: Iterates through the keys of an object.
    -   If a key is determined to be sensitive by `isSensitiveKey()`, its value is replaced with `[REDACTED]`.
    -   Otherwise, it calls `sanitizeValue` on the value.

-   **`isSensitiveKey(key)`**: Checks if a given key string contains common sensitive keywords (e.g., "password", "token", "secret").
