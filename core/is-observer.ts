import { isAbortSignal, isObject, MinimumArgumentsRequiredError } from "@xan/observable-internal";
import { Observer } from "./observer.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observer} interface.
 * @example
 * ```ts
 * import { isObserver, Observer } from "@observable/core";
 *
 * const instance = new Observer((value) => {
 *   // Implementation omitted for brevity.
 * });
 * isObserver(instance); // true
 *
 * const literal: Observer = {
 *   signal: {
 *     aborted: false,
 *     onabort: null,
 *     throwIfAborted() {
 *       // Implementation omitted for brevity.
 *     },
 *     addEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     removeEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     dispatchEvent() {
 *       // Implementation omitted for brevity.
 *     },
 *   },
 *   next(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   return() {
 *     // Implementation omitted for brevity.
 *   },
 *   throw(value) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isObserver(literal); // true
 * ```
 */
export function isObserver(value: unknown): value is Observer {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof Observer ||
    (isObject(value) &&
      "next" in value &&
      typeof value.next === "function" &&
      "return" in value &&
      typeof value.return === "function" &&
      "throw" in value &&
      typeof value.throw === "function" &&
      "signal" in value &&
      isAbortSignal(value.signal))
  );
}
