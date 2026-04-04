import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";

/**
 * Drops the first {@linkcode count} of [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * values from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * Positive integer count
 * ```ts
 * import { drop } from "@observable/drop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), drop(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 * @example
 * Positive fractional count
 * ```ts
 * import { drop } from "@observable/drop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), drop(2.3)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 * @example
 * 0 count
 * ```ts
 * import { drop } from "@observable/drop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), drop(0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 * @example
 * Negative integer count
 * ```ts
 * import { drop } from "@observable/drop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), drop(-1)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
 * ```
 * @example
 * NaN count
 * ```ts
 * import { drop } from "@observable/drop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), drop(NaN)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
 * ```
 */
export function drop<Value>(count: number): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof count !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");

  count = Math.trunc(count);

  return function dropFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");

    if (count < 0 || Number.isNaN(count)) return empty;

    if (count === 0) return from(source);

    return pipe(source, filter((_, index) => index >= count));
  };
}
