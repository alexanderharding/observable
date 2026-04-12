import { isObservable, type Observable } from "@observable/core";
import { scan } from "@observable/scan";
import { pipe } from "@observable/pipe";
import { at } from "@observable/at";

/**
 * {@linkcode reducer|Reduces} each {@linkcode In|value} to a single {@linkcode Out|value} on
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return).
 * @example
 * ```ts
 * import { reduce } from "@observable/reduce";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observable = forOf([1, 2, 3]);
 *
 * pipe(observable, reduce((previous, current) => previous + current, 0)).subscribe({
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
  initialValue: Out,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof reducer !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function reduceFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    return pipe(source, scan(reducer, initialValue), at(-1));
  };
}
