import { Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode factory|Creates} a new [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * for each [consumer](https://jsr.io/@observable/core#consumer).
 * @example
 * ```ts
 * import { defer } from "@observable/defer";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * let values = [1, 2, 3];
 * const observable = defer(() => pipe(values, ofIterable()));
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
  if (typeof factory !== "function") throw new ParameterTypeError(0, "Function");
  return new Observable((observer) => pipe(factory(), asObservable()).subscribe(observer));
}
