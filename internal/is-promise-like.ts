import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode PromiseLike} interface.
 * @example
 * ```ts
 * import { isPromiseLike } from "@observable/internal";
 *
 * const promiseLikeLiteral: PromiseLike<unknown> = {
 *   then(onfulfilled, onrejected) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isPromiseLike(promiseLikeLiteral); // true
 *
 * const notAPromiseLike = {};
 * isPromiseLike(notAPromiseLike); // false
 * ```
 */
export function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return value instanceof Promise || (
    typeof value === "object" && value !== null && "then" in value &&
    typeof value.then === "function"
  );
}
