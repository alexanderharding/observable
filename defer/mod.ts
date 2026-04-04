import { Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * {@linkcode factory|Creates} a new [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * for each [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { defer } from "@observable/defer";
 * import { forOf } from "@observable/for-of";
 *
 * const controller = new AbortController();
 * let values = [1, 2, 3];
 * const observable = defer(() => forOf(values));
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
 * ```
 */
export function defer<Value>(
  factory: () => Observable<Value>,
): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof factory !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return new Observable((observer) => from(factory()).subscribe(observer));
}
