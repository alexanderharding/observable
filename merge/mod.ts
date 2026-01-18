import type { Observable } from "@observable/core";
import {
  identity,
  isIterable,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { mergeMap } from "@observable/merge-map";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which concurrently
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from every given
 * [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { merge } from "@observable/merge";
 * import { Subject } from "@observable/core";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source1 = new Subject<number>();
 * const source2 = new Subject<number>();
 * const source3 = new Subject<number>();
 *
 * merge([source1, source2, source3]).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source1.next(1); // "next" 1
 * source2.next(2); // "next" 2
 * source3.next(3); // "next" 3
 * source1.return();
 * source1.next(4); // "next" 4
 * source2.return();
 * source2.next(5); // "next" 5
 * source3.return(); // "return"
 * ```
 */
export function merge<Value>(
  // Accepting an Iterable is a design choice for performance (iterables are lazily evaluated) and
  // flexibility (can accept any iterable, not just arrays).
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  return pipe(of(sources), mergeMap(identity));
}
