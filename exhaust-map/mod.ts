import { isObservable, type Observable, Observer } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { tap } from "@observable/tap";
import { filter } from "@observable/filter";
import { switchMap } from "@observable/switch-map";

/**
 * {@linkcode project|Projects} each [source](https://jsr.io/@observable/core#source) value to an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) only if the previous
 * {@linkcode project|projected} [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) has
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)ed.
 * @example
 * ```ts
 * import { exhaustMap } from "@observable/exhaust-map";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 * import { timeout } from "@observable/timeout";
 * import { map } from "@observable/map";
 *
 * const controller = new AbortController();
 * const source = of([1, 2, 3]);
 *
 * pipe(
 *   source,
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
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function exhaustMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    return defer(() => {
      let activeInnerSubscription = false;
      return pipe(
        source,
        filter(() => !activeInnerSubscription),
        switchMap((value, index) => {
          activeInnerSubscription = true;
          return pipe(
            project(value, index),
            tap(new Observer({ return: processReturn, throw: noop })),
          );

          function processReturn(): void {
            activeInnerSubscription = false;
          }
        }),
      );
    });
  };
}
