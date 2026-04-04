import { MinimumArgumentsRequiredError } from "@observable/internal";
import { Observable } from "./observable.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observable} interface.
 * @example
 * Instance
 * ```ts
 * import { isObservable, Observable } from "@observable/core";
 *
 * const value = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 *
 * isObservable(value); // true
 * ```
 * @example
 * Object Literal
 * ```ts
 * import { isObservable, Observable } from "@observable/core";
 *
 * const value: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 *
 * isObservable(value); // true
 * ```
 * @example
 * Empty Object Literal
 * ```ts
 * import { isObservable } from "@observable/core";
 *
 * const value = {};
 *
 * isObservable(value); // false
 * ```
 * @example
 * Primitive
 * ```ts
 * import { isObservable } from "@observable/core";
 *
 * const value = 1;
 *
 * isObservable(value); // false
 * ```
 */
export function isObservable(value: unknown): value is Observable {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof Observable ||
    ((typeof value === "object" && value !== null) &&
      "subscribe" in value &&
      typeof value.subscribe === "function")
  );
}
