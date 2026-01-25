import { Observable } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that emits a sequence of {@linkcode values} in order on
 * [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { of } from "@observable/of";
 *
 * const controller = new AbortController();
 *
 * of([1, 2, 3]).subscribe({
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
 * @example
 * ```ts
 * import { of } from "@observable/of";
 *
 * let count = 0;
 * const controller = new AbortController();
 *
 * of([1, 2, 3]).subscribe({
 *   signal: controller.signal,
 *   next(value) {
 *     console.log("next", value);
 *     if (value === 2) controller.abort();
 *   },
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * ```
 */
export function of<const Values extends ReadonlyArray<unknown>>(
  values: Values,
): Observable<Values[number]>;
export function of<Value>(
  values: Iterable<Value>,
): Observable<Value>;
export function of<Value>(
  // Accepting any iterable is a design choice for performance (iterables are
  // lazily evaluated) and flexibility.
  values: Iterable<Value>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(values)) throw new ParameterTypeError(0, "Iterable");
  return new Observable((observer) => {
    for (const value of values) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
}
