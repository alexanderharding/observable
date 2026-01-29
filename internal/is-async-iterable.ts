import { MinimumArgumentsRequiredError } from "./minimum-arguments-required-error.ts";
import { isObject } from "./is-object.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode AsyncIterable} interface.
 * @example
 * ```ts
 * import { isAsyncIterable } from "@observable/internal";
 *
 * const asyncIterableLiteral: AsyncIterable<unknown> = {
 *   [Symbol.asyncIterator]() {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * isAsyncIterable(asyncIterableLiteral); // true
 *
 * const notAnAsyncIterable = {};
 * isAsyncIterable(notAnAsyncIterable); // false
 * ```
 */
export function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    isObject(value) &&
    Symbol.asyncIterator in value &&
    typeof value[Symbol.asyncIterator] === "function"
  );
}
