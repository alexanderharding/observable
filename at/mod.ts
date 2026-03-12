import { isObservable, Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { take } from "@observable/take";
import { drop } from "@observable/drop";
import { empty } from "@observable/empty";
import { from } from "@observable/from";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s only the value at the specified {@linkcode index} integer in a sequence of
 * values from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * Negative {@linkcode index} integers count back from the last item in the sequence.
 * @example
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(forOf([1, 2, 3]), at(1)).subscribe({
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "return"
 * ```
 * @example
 * ```ts
 * import { at } from "@observable/at";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(forOf([1, 2, 3]), at(-1)).subscribe({
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 3
 * // "return"
 * ```
 */
export function at<Value>(index: number): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof index !== "number") throw new ParameterTypeError(0, "Number");
  return function atFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");

    // Early return for NaN index case, as this is not a valid index.
    if (Number.isNaN(index)) return empty;

    // Early return for infinite index cases, as this can be handled by other operators.
    if (index === Infinity || index === -Infinity) return pipe(source, drop<never>(Infinity));

    // Convert the index to an integer, rounding towards zero.
    index = index >= 0 ? Math.floor(index) : Math.ceil(index);

    // Early return for index 0 case, as this can be handled by other operators.
    if (index === 0) return pipe(source, take(1));

    // Early return for positive index case, as this can be handled by other operators.
    if (index > 0) return pipe(source, filter((_, i) => i === index), take(1));

    // Convert the source to an observable if it is not already so we don't have to do this on
    // every subscription.
    source = from(source);

    /**
     * The maximum length of the buffer so we can be memory efficient. Because we are in the negative index case,
     * we need to use the absolute value of the index to get the maximum length of the buffer.
     */
    const maxBufferLength = -index;

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
