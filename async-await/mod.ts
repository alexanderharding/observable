import { Observable } from "@observable/core";
import { MinimumArgumentsRequiredError } from "@observable/internal";

/**
 * Uses the [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
 * syntax to [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) the provided
 * {@linkcode expression} and [`next`](https://jsr.io/@observable/core/doc/~/Observer.next) it's resolved value through
 * the returned [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @param expression - A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), a [thenable object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables), or any value to wait for.
 * @example
 * Resolved promise
 * ```ts
 * import { asyncAwait } from "@observable/async-await";
 *
 * asyncAwait(Promise.resolve(42)).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 42
 * // "return"
 * ```
 * @example
 * Thenable object
 * ```ts
 * import { asyncAwait } from "@observable/async-await";
 *
 * asyncAwait({ then: (onfulfilled: (value: 7) => void) => onfulfilled(7) }).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 7
 * // "return"
 * ```
 * @example
 * Primitive value
 * ```ts
 * import { asyncAwait } from "@observable/async-await";
 *
 * asyncAwait(8).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 8
 * // "return"
 * ```
 * @example
 * Rejected promise
 * ```ts
 * import { asyncAwait } from "@observable/async-await";
 *
 * asyncAwait(Promise.reject(new Error("test"))).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "throw" Error: test
 * ```
 */
export function asyncAwait<const Expression>(
  expression: Expression,
): Observable<Awaited<Expression>> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return new Observable(async (observer) => {
    try {
      observer.next(await expression);
      observer.return();
    } catch (value) {
      observer.throw(value);
    }
  });
}
