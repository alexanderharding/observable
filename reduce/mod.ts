import { isObservable, type Observable } from "@observable/core";
import { scan } from "@observable/scan";
import { pipe } from "@observable/pipe";
import { at } from "@observable/at";

/**
 * {@linkcode reducer|Reduces} the [source](https://jsrio/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values to a single
 * value when the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { reduce } from "@observable/reduce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = forOf([1, 2, 3]);
 * pipe(source, reduce((previous, current) => previous + current, 0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 6
 * // "return"
 * ```
 */
export function reduce<In, Out>(
  reducer: (previous: Out, current: In, index: number) => Out,
  seed: Out,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof reducer !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function reduceFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    return pipe(source, scan(reducer, seed), at(-1));
  };
}
