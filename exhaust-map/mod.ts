import { isObservable, type Observable } from "@observable/core";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { switchMap } from "@observable/switch-map";
import { finalize } from "@observable/finalize";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) ignoring any new
 * {@linkcode In|values} until the {@linkcode project|projected} [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { exhaustMap } from "@observable/exhaust-map";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { timeout } from "@observable/timeout";
 * import { map } from "@observable/map";
 *
 * const controller = new AbortController();
 * const observable = forOf([1, 2, 3]);
 *
 * pipe(
 *   observable,
 *   exhaustMap((value) => pipe(timeout(100), map(() => value))),
 * ).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 100ms):
 * // "next" 1
 * // "return"
 * ```
 */
export function exhaustMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function exhaustMapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    return defer(() => {
      let activeInnerSubscription = false;
      return pipe(
        source,
        filter(() => !activeInnerSubscription),
        switchMap((value, index) => {
          activeInnerSubscription = true;
          return pipe(project(value, index), finalize(() => activeInnerSubscription = false));
        }),
      );
    });
  };
}
