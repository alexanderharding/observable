import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { exhaustMap } from "@observable/exhaust-map";
import { filter } from "@observable/filter";
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { timeout } from "@observable/timeout";
import { drop } from "@observable/drop";

/**
 * Throttles each {@linkcode Value|value} by the given {@linkcode milliseconds}.
 * @example
 * Positive integer milliseconds
 * ```ts
 * import { throttle } from "@observable/throttle";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 *
 * pipe(subject, throttle(100)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1); // Emitted immediately
 * subject.next(2); // Ignored (within throttle window)
 * subject.next(3); // Ignored (within throttle window)
 *
 * // After 100ms, the next value will be emitted
 * subject.next(4); // Emitted after throttle window
 *
 * // Console output:
 * // "next" 1
 * // (after 100ms)
 * // "next" 4
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { throttle } from "@observable/throttle";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), throttle(0)).subscribe({
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
 * // "return"
 * ```
 * @example
 * Negative integer milliseconds
 * ```ts
 * import { throttle } from "@observable/throttle";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), throttle(-1)).subscribe({
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
 * import { throttle } from "@observable/throttle";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), throttle(NaN)).subscribe({
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
 * Infinity milliseconds
 * ```ts
 * import { throttle } from "@observable/throttle";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 *
 * pipe(subject, throttle(Infinity)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1);
 * subject.next(2);
 * subject.return();
 *
 * // Console output (synchronously):
 * // "next" 1
 * // "return"
 * ```
 */
export function throttle<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  return function throttleFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, filter((_, index) => index === 0));
    if (milliseconds === 0) return from(source);
    return pipe(
      source,
      exhaustMap((value) => flat([of(value), pipe(timeout(milliseconds), drop<never>(Infinity))])),
    );
  };
}
