import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";
import { empty } from "@observable/empty";

/**
 * [Pushes](https://jsr.io/@observable/core#push) the first of the given {@linkcode count} of {@linkcode Value|values}.
 * @example
 * Positive integer count
 * ```ts
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "return"
 * ```
 * @example
 * Positive fractional count
 * ```ts
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(2.7)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "return"
 * ```
 * @example
 * 0 count
 * ```ts
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(0)).subscribe({
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
 * Negative integer count
 * ```ts
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(-1)).subscribe({
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
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(NaN)).subscribe({
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
 * Infinite count
 * ```ts
 * import { take } from "@observable/take";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3, 4, 5]), take(Infinity)).subscribe({
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
 */
export function take<Value>(count: number): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof count !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");

  count = Math.trunc(count);

  return function takeFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");

    if (count <= 0 || Number.isNaN(count)) return empty;

    source = from(source);

    if (count === Infinity) return source;

    return new Observable((observer) => {
      let seen = 0;
      const controller = new AbortController();
      source.subscribe({
        signal: AbortSignal.any([observer.signal, controller.signal]),
        next(value) {
          const isLastValue = ++seen === count;
          if (isLastValue) controller.abort();
          observer.next(value);
          if (isLastValue) observer.return();
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
