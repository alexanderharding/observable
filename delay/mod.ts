import { isObservable, type Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { mergeMap } from "@observable/merge-map";
import { timeout } from "@observable/timeout";
import { map } from "@observable/map";
import { never } from "@observable/never";

/**
 * Delays the [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing of values from the
 * [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * by a given number of {@linkcode milliseconds}.
 * @example
 * ```ts
 * import { delay } from "@observable/delay";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), delay(1_000)).subscribe({
 *   signal: controller.signal, 
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 */
export function delay<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") throw new ParameterTypeError(0, "Number");
  return function delayFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return never;
    return pipe(
      source,
      milliseconds === 0
        ? toObservable
        : mergeMap((value) => pipe(timeout(milliseconds), map(() => value))),
    );
  };
}
