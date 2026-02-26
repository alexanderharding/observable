import { Observable } from "@observable/core";
import {
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * Projects an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each {@linkcode Values|value} in order upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { sequence } from "@observable/sequence";
 *
 * const controller = new AbortController();
 * sequence([1, 2, 3]).subscribe({
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
export function sequence<const Values extends ReadonlyArray<unknown>>(
  values: Values,
): Observable<Values[number]>;
/**
 * Projects an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each {@linkcode Value|value} in order upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { sequence } from "@observable/sequence";
 *
 * const controller = new AbortController();
 * sequence(new Set([1, 2, 1, 2, 3, 3])).subscribe({
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
export function sequence<Value>(values: Iterable<Value>): Observable<Value>;
export function sequence<Value>(values: Iterable<Value>): Observable<Value> {
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
