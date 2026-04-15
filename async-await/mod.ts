import { Observable } from "@observable/core";

/**
 * [`Await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)s the given
 * {@linkcode expression} and [pushes](https://jsr.io/@observable/core#push) its resolved value.
 * @example
 * Resolved promise
 * ```ts
 * import { asyncAwait } from "@observable/async-await";
 *
 * const controller = new AbortController();
 *
 * asyncAwait(Promise.resolve(42)).subscribe({
 *   signal: controller.signal,
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
 * const controller = new AbortController();
 *
 * asyncAwait({ then: (onfulfilled: (value: 7) => void) => onfulfilled(7) }).subscribe({
 *   signal: controller.signal,
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
 * const controller = new AbortController();
 *
 * asyncAwait(8).subscribe({
 *   signal: controller.signal,
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
 * const controller = new AbortController();
 *
 * asyncAwait(Promise.reject(new Error("test"))).subscribe({
 *   signal: controller.signal,
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
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return new Observable(async (observer) => {
    try {
      observer.next(await expression);
      observer.return();
    } catch (value) {
      observer.throw(value);
    }
  });
}
