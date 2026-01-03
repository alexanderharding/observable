import { isEventTarget } from "./is-event-target.ts";
import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode AbortSignal} interface.
 * @example
 * ```ts
 * import { isAbortSignal } from "@observable/shared";
 *
 * const abortSignalInstance = new AbortController().signal;
 * isAbortSignal(abortSignalInstance); // true
 *
 * const abortSignalLiteral: AbortSignal = {
 *   aborted: false,
 *   reason: null,
 *   onabort: null,
 *   throwIfAborted() {
 *     // Implementation omitted for brevity.
 *   },
 *   addEventListener() {
 *     // Implementation omitted for brevity.
 *   },
 *   removeEventListener() {
 *     // Implementation omitted for brevity.
 *   },
 *   dispatchEvent() {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isAbortSignal(abortSignalLiteral); // true
 *
 * const notAnAbortSignal = {};
 * isAbortSignal(notAnAbortSignal); // false
 * ```
 */
export function isAbortSignal(value: unknown): value is AbortSignal {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof AbortSignal ||
    (isEventTarget(value) &&
      "aborted" in value &&
      typeof value.aborted === "boolean" &&
      "onabort" in value &&
      (typeof value.onabort === "function" || value.onabort === null) &&
      "throwIfAborted" in value &&
      typeof value.throwIfAborted === "function" &&
      "reason" in value)
  );
}
