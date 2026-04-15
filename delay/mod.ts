import { isObservable, type Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { mergeMap } from "@observable/merge-map";
import { timeout } from "@observable/timeout";
import { map } from "@observable/map";
import { drop } from "@observable/drop";
import { from } from "@observable/from";

/**
 * Delays {@linkcode Value|values} by the given {@linkcode milliseconds}.
 * @example
 * 1000 milliseconds
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(1_000)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 * @example
 * Infinite milliseconds
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(Infinity)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 * @example
 * Negative milliseconds
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(-1)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 * @example
 * NaN milliseconds
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(NaN))).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 */
export function delay<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  return function delayFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, drop<never>(Infinity));
    if (milliseconds === 0) return from(source);
    return pipe(source, mergeMap((value) => pipe(timeout(milliseconds), map(() => value))));
  };
}
