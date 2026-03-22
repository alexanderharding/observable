import type { Observable } from "@observable/core";
import {
  identity,
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";
import { flatMap } from "@observable/flat-map";
import { empty } from "@observable/empty";

/**
 * Sequentially [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from the first given
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) until it
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s and then moves on to the next and so on.
 * @example
 * Array of sources
 * ```ts
 * import { flat } from "@observable/flat";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const source1 = forOf([1, 2, 3]);
 * const source2 = forOf([4, 5, 6]);
 * const source3 = forOf([7, 8, 9]);
 *
 * const controller = new AbortController();
 *
 * flat([source1, source2, source3]).subscribe({
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
 * // "next" 6
 * // "next" 7
 * // "next" 8
 * // "next" 9
 * // "return"
 * ```
 * @example
 * Empty array
 * ```ts
 * import { flat } from "@observable/flat";
 *
 * const controller = new AbortController();
 * flat([]).subscribe({
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
export function flat<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
/**
 * Sequentially [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from the first given
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) until it
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s and then moves on to the next and so on.
 * @example
 * Iterable of sources
 * ```ts
 * import { flat } from "@observable/flat";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source1 = forOf([1, 2, 3]);
 * const source2 = source1;
 * const source3 = forOf([4, 5, 6]);
 *
 * flat(new Set([source1, source2, source3])).subscribe({
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
 * // "next" 6
 * // "return"
 * ```
 */
export function flat<Value>(
  sources: Iterable<Observable<Value>>,
): Observable<Value>;
export function flat<Value>(
  // Accepting any iterable is a design choice for performance (iterables are
  // lazily evaluated) and flexibility.
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  if (Array.isArray(sources) && !sources.length) return empty;
  return pipe(forOf(sources), flatMap(identity));
}
