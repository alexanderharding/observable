import { Observable } from "@observable/core";

/**
 * Projects an [`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each {@linkcode Value|value} in order, then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { forAwaitOf } from "@observable/for-await-of";
 *
 * async function* generateValues(): AsyncGenerator<1 | 2 | 3, void, unknown> {
 *   yield await Promise.resolve(1 as const);
 *   yield await Promise.resolve(2 as const);
 *   yield await Promise.resolve(3 as const);
 * }
 *
 * const activeSubscriptionController = new AbortController();
 * forAwaitOf(generateValues()).subscribe({
 *   signal: activeSubscriptionController.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 */
export function forAwaitOf<Value>(values: AsyncIterable<Value>): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isAsyncIterable(values)) throw new TypeError("Parameter 1 is not of type 'AsyncIterable'");
  return new Observable(async (observer) => {
    try {
      for await (const value of values) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    } catch (value) {
      observer.throw(value);
    }
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode AsyncIterable} interface.
 * @internal Do NOT export
 */
function isAsyncIterable(value: unknown): value is AsyncIterable<unknown> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    (typeof value === "object" && value !== null) &&
    Symbol.asyncIterator in value &&
    typeof value[Symbol.asyncIterator] === "function"
  );
}
