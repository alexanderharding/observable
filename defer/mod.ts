import { Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that, on
 * [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe), calls an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) {@linkcode factory} to
 * get an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) for each
 * [`Observer`](https://jsr.io/@observable/core/doc/~/Observer).
 * @example
 * ```ts
 * import { defer } from "@observable/defer";
 * import { of } from "@observable/of";
 *
 * const controller = new AbortController();
 * let values = [1, 2, 3];
 * const observable = defer(() => of(values));
 *
 * observable.subscribe({
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
 *
 * values = [4, 5, 6];
 * observable.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 4
 * // "next" 5
 * // "next" 6
 * // "return"
 */
export function defer<Value>(
  factory: () => Observable<Value>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof factory !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return new Observable((observer) => toObservable(factory()).subscribe(observer));
}
