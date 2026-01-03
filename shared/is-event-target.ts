import { MinimumArgumentsRequiredError } from "@observable/shared";
import { isObject } from "./is-object.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode EventTarget} interface.
 * @example
 * ```ts
 * import { isEventTarget } from "@observable/shared";
 *
 * const eventTargetInstance = new EventTarget();
 * isEventTarget(eventTargetInstance); // true
 *
 * const eventTargetLiteral: EventTarget = {
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
 * isEventTarget(eventTargetLiteral); // true
 *
 * const notAnEventTarget = {};
 * isEventTarget(notAnEventTarget); // false
 * ```
 */
export function isEventTarget(value: unknown): value is EventTarget {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    isObject(value) &&
    "addEventListener" in value &&
    typeof value.addEventListener === "function" &&
    "removeEventListener" in value &&
    typeof value.removeEventListener === "function" &&
    "dispatchEvent" in value &&
    typeof value.dispatchEvent === "function"
  );
}
