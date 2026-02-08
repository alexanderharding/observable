import { Observable } from "@observable/core";
import {
  isAsyncIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";

/**
 * Projects an [`AsyncIterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each value in order, then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { ofAsyncIterable } from "@observable/of-async-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * async function* generateValues(): AsyncGenerator<1 | 2 | 3, void, unknown> {
 *   yield await Promise.resolve(1 as const);
 *   yield await Promise.resolve(2 as const);
 *   yield await Promise.resolve(3 as const);
 * }
 *
 * const controller = new AbortController();
 * pipe(generateValues(), ofAsyncIterable()).subscribe({
 *   signal: controller.signal,
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
export function ofAsyncIterable<Value>(): (
  source: AsyncIterable<Value>,
) => Observable<Value> {
  return function ofAsyncIterableFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isAsyncIterable(source)) throw new ParameterTypeError(0, "AsyncIterable");
    return new Observable(async (observer) => {
      try {
        for await (const value of source) {
          observer.next(value);
          if (observer.signal.aborted) return;
        }
        observer.return();
      } catch (value) {
        observer.throw(value);
      }
    });
  };
}
