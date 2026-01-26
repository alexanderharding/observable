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
import { empty } from "@observable/empty";

/**
 * Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which concurrently
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from every given
 * [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { merge } from "@observable/merge";
 * import { Subject } from "@observable/core";
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
 * source1.next(4); // "next" 4
 * source2.next(5); // "next" 5
 * source1.return();
 * source2.return();
 * source3.return(); // "return"
 * ```
 */
export function merge<const Values extends ReadonlyArray<unknown>>(
  sources: Readonly<{ [Key in keyof Values]: Observable<Values[Key]> }>,
): Observable<Values[number]>;
/**
 * Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which concurrently
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from every given
 * [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { merge } from "@observable/merge";
 * import { Subject } from "@observable/core";
 *
 * const controller = new AbortController();
 * const source1 = new Subject<number>();
 * const source2 = source1;
 * const source3 = new Subject<number>();
 *
 * merge(new Set([source1, source2, source3])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source1.next(1); // "next" 1
 * source2.next(2); // "next" 2
 * source3.next(3); // "next" 3
 * source1.next(4); // "next" 4
 * source2.next(5); // "next" 5
 * source1.return();
 * source2.return();
 * source3.return(); // "return"
 * ```
 */
export function merge<Value>(
  sources: Iterable<Observable<Value>>,
): Observable<Value>;
export function merge<Value>(
  // Accepting any iterable is a design choice for performance (iterables are
  // lazily evaluated) and flexibility.
  sources: Iterable<Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isIterable(sources)) throw new ParameterTypeError(0, "Iterable");
  if (Array.isArray(sources) && !sources.length) return empty;
  return pipe(of(sources), mergeMap(identity));
}
