import { isObservable, type Observable } from "@observable/core";
import { from } from "@observable/from";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";

/**
 * {@linkcode reducer|Reduces} the [source](https://jsrio/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values to a single
 * value, and [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s each
 * intermediate reduced value.
 * @example
 * ```ts
 * import { scan } from "@observable/scan";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = pipe([1, 2, 3], ofIterable());
 * pipe(source, scan((previous, current) => previous + current, 0)).subscribe({
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
  seed: Out,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof reducer !== "function") throw new ParameterTypeError(0, "Function");
  return function scanFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return defer(() => {
      let previous = seed;
      return pipe(
        source,
        map((current, index) => (previous = reducer(previous, current, index))),
      );
    });
  };
}
