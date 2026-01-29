import { Observable } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * Projects an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
 * through an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing each value in order, then
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * pipe([1, 2, 3], ofIterable()).subscribe({
 *   signal: new AbortController().signal,
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
 * @example
 * ```ts
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(new Set([1, 1, 2, 2, 3, 3]), ofIterable()).subscribe({
 *   signal: new AbortController().signal,
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
export function ofIterable<Value>(): (
  source: Iterable<Value>,
) => Observable<Value> {
  return function ofIterableFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isIterable(source)) throw new ParameterTypeError(0, "Iterable");
    if (Array.isArray(source) && !source.length) return empty;
    return new Observable((observer) => {
      for (const value of source) {
        observer.next(value);
        if (observer.signal.aborted) return;
      }
      observer.return();
    });
  };
}
