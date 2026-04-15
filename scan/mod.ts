import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";

/**
 * {@linkcode reducer|Reduces} each {@linkcode In|value} to an intermediate {@linkcode Out|value}.
 * @example
 * ```ts
 * import { scan } from "@observable/scan";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observable = forOf([1, 2, 3]);
 *
 * pipe(observable, scan((previous, current) => previous + current, 0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 3
 * // "next" 6
 * // "return"
 * ```
 */
export function scan<In, Out>(
  reducer: (previous: Out, current: In, index: number) => Out,
  initialValue: Out,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof reducer !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function scanFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return defer(() => {
      let previous = initialValue;
      return pipe(
        source,
        map((current, index) => (previous = reducer(previous, current, index))),
      );
    });
  };
}
