import { isObject, MinimumArgumentsRequiredError } from "@observable/internal";
import { Observable } from "./observable.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observable} interface.
 * @example
 * ```ts
 * import { isObservable, Observable } from "@observable/core";
 *
 * const observableInstance = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 * isObservable(observableInstance); // true
 *
 * const observableLiteral: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isObservable(observableLiteral); // true
 *
 * const notAnObservable = {};
 * isObservable(notAnObservable); // false
 * ```
 */
export function isObservable(value: unknown): value is Observable {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof Observable ||
    (isObject(value) &&
      "subscribe" in value &&
      typeof value.subscribe === "function")
  );
}
