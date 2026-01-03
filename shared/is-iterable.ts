import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";
import { isObject } from "./is-object.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Iterable} interface.
 * @example
 * ```ts
 * import { isIterable } from "@observable/shared";
 *
 * const iterableLiteral: Iterable<unknown> = {
 *   [Symbol.iterator]() {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isIterable(iterableLiteral); // true
 *
 * const notAnIterable = {};
 * isIterable(notAnIterable); // false
 * ```
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    isObject(value) &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === "function"
  );
}
