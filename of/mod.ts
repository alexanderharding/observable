import { Observable } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a sequence of {@linkcode values}
 * in order on [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and then
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
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
 */
export function of<const Values extends ReadonlyArray<unknown>>(
  values: Values,
): Observable<Values[number]>;
/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a sequence of {@linkcode values}
 * in order on [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and then
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { of } from "@observable/of";
 *
 * const controller = new AbortController();
 *
 * of(new Set([1, 1, 2, 2, 3, 3])).subscribe({
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
  if (Array.isArray(values) && !values.length) return empty;
  return new Observable((observer) => {
    for (const value of values) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
}
