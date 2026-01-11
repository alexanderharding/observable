import { Observable } from "@xan/observable-core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that emits a sequence of {@linkcode values} in order on
 * [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe) and then [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { of } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * of([1, 2, 3]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // console output:
 * // 1
 * // 2
 * // 3
 * // return
 * ```
 * @example
 * ```ts
 * import { of } from "@xan/observable-common";
 *
 * let count = 0;
 * const controller = new AbortController();
 *
 * of([1, 2, 3]).subscribe({
 *   signal: controller.signal,
 *   next(value) {
 *     if (value === 2) controller.abort();
 *     console.log(value);
 *   },
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // console output:
 * // 1
 * // 2
 * ```
 */
export function of<Value>(
  // Accepting an Iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
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
