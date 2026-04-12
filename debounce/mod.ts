import { isObservable, type Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { switchMap } from "@observable/switch-map";
import { timeout } from "@observable/timeout";
import { drop } from "@observable/drop";
import { from } from "@observable/from";
import { flat } from "@observable/flat";
import { of } from "@observable/of";

/**
 * Debounces each {@linkcode Value|value} by the given {@linkcode milliseconds}.
 * @example
 * Positive integer milliseconds
 * ```ts
 * import { debounce } from "@observable/debounce";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 *
 * pipe(subject, debounce(100)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1);
 * subject.next(2);
 * subject.next(3);
 *
 * // Console output (after 100ms):
 * // "next" 3
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { debounce } from "@observable/debounce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), debounce(0)).subscribe({
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
 * import { debounce } from "@observable/debounce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), debounce(-1)).subscribe({
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
 * import { debounce } from "@observable/debounce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), debounce(NaN)).subscribe({
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
 * import { debounce } from "@observable/debounce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), debounce(Infinity)).subscribe({
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
export function debounce<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  return function debounceFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, drop(Infinity));
    if (milliseconds === 0) return from(source);
    return pipe(
      source,
      switchMap((value) => flat([pipe(timeout(milliseconds), drop<never>(Infinity)), of(value)])),
    );
  };
}
