import type { Observable } from "@xan/observable-core";
import {
  identity,
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import { of } from "./of.ts";
import { pipe } from "./pipe.ts";
import { flatMap } from "./flat-map.ts";

/**
 * Creates an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) which sequentially emits all values from the first given
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) and then moves on to the next.
 * @example
 * ```ts
 * import { flat, pipe, of } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * flat(of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // 7
 * // 8
 * // 9
 * // return
 * ```
 */
export function flat<Value>(
  // Accepting an Iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  return pipe(of(sources), flatMap(identity));
}
