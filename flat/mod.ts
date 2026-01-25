import type { Observable } from "@observable/core";
import {
  identity,
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { flatMap } from "@observable/flat-map";

/**
 * Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which sequentially emits all values from the first given
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and then moves on to the next.
 * @example
 * ```ts
 * import { flat } from "@observable/flat";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * flat(of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])).subscribe({
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
 */
export function flat<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
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
  return pipe(of(sources), flatMap(identity));
}
