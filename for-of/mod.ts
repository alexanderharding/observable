import { Observable } from "@observable/core";
import { ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * Projects an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each {@linkcode Values|value} in order upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * Populate array
 * ```ts
 * import { forOf } from "@observable/for-of";
 *
 * const controller = new AbortController();
 * forOf([1, 2, 3]).subscribe({
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
 * Empty array
 * ```ts
 * import { forOf } from "@observable/for-of";
 *
 * const controller = new AbortController();
 * forOf([]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 */
export function forOf<const Values extends ReadonlyArray<unknown>>(
  values: Values,
): Observable<Values[number]>;
/**
 * Projects an [`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each {@linkcode Value|value} in order upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { forOf } from "@observable/for-of";
 *
 * const controller = new AbortController();
 * forOf(new Set([1, 2, 1, 2, 3, 3])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 */
export function forOf<Value>(iterable: Iterable<Value>): Observable<Value>;
export function forOf<Value>(iterable: Iterable<Value>): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isIterable(iterable)) throw new ParameterTypeError(0, "Iterable");
  if (Array.isArray(iterable) && !iterable.length) return empty;
  return new Observable((observer) => {
    for (const value of iterable) {
      observer.next(value);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Iterable} interface.
 * @internal Do NOT export
 */
function isIterable(value: unknown): value is Iterable<unknown> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    (typeof value === "object" && value !== null) &&
    Symbol.iterator in value &&
    typeof value[Symbol.iterator] === "function"
  );
}
