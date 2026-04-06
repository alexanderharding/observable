import { isObservable, Observable } from "@observable/core";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { take } from "@observable/take";
import { drop } from "@observable/drop";
import { empty } from "@observable/empty";
import { from } from "@observable/from";

/**
 * Filters [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to only the [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * value at the given {@linkcode index}. Negative {@linkcode index|indices} count back from the last
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value in the sequence.
 * @example
 * Positive index integer
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(1)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "next" 2
 * // "return"
 * ```
 * @example
 * Positive index fractional
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(1.7)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "next" 2
 * // "return"
 * ```
 * @example
 * 0 index
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "next" 1
 * // "return"
 * ```
 * @example
 * Negative index integer
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-1)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "tap next" 3
 * // "next" 3
 * // "return"
 * ```
 * @example
 * Negative index fractional
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-1.7)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "tap next" 3
 * // "next" 3
 * // "return"
 * ```
 * @example
 * Infinity index
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(Infinity)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "tap next" 3
 * // "return"
 * ```
 * @example
 * -Infinity index
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(-Infinity)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "tap next" 2
 * // "tap next" 3
 * // "return"
 * ```
 * @example
 * NaN index
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { tap } from "@observable/tap";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), tap((value) => console.log("tap next", value)), at(NaN)).subscribe({
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
export function at<Value>(index: number): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof index !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");

  index = Math.trunc(index);

  return function atFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");

    if (Number.isNaN(index)) return empty;

    if (index === Infinity || index === -Infinity) return pipe(source, drop<never>(Infinity));

    if (index === 0) return pipe(source, take(1));

    if (index > 0) return pipe(source, filter((_, i) => i === index), take(1));

    source = from(source);

    /**
     * The maximum length of the buffer so we can be memory efficient.
     */
    const maxBufferLength = Math.abs(index);

    // Note that we could compose a few different operators to achieve the same result, but this is
    // a more direct implementation that is easier to understand and reason about.
    return new Observable((observer) => {
      /**
       * The buffer of potential matching values. Because we trim the buffer in subsequent logic,
       * the matching value will always be the item at the index 0 of the buffer once we hit the maximum length.
       */
      const buffer: Array<Value> = [];

      // Clear the buffer on teardown.
      observer.signal.addEventListener("abort", () => buffer.length = 0, { once: true });

      source.subscribe({
        signal: observer.signal,
        next(value) {
          buffer.push(value);
          if (buffer.length > maxBufferLength) buffer.shift();
        },
        return() {
          if (buffer.length === maxBufferLength) observer.next(buffer[0]);
          observer.return();
        },
        throw: (value) => observer.throw(value),
      });
    });
  };
}
