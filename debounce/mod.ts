import { isObservable, type Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { switchMap } from "@observable/switch-map";
import { timeout } from "@observable/timeout";
import { map } from "@observable/map";
import { ignoreElements } from "@observable/ignore-elements";
import { asObservable } from "@observable/as-observable";

/**
 * Debounces the [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * by the specified number of {@linkcode milliseconds}.
 * @example
 * ```ts
 * import { debounce } from "@observable/debounce";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 *
 * pipe(source, debounce(100)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source.next(1);
 * source.next(2);
 * source.next(3); // Only this value will be emitted after 100ms
 *
 * // Console output (after 100ms):
 * // "next" 3
 * ```
 */
export function debounce<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  return function debounceFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, ignoreElements());
    if (milliseconds === 0) return pipe(source, asObservable());
    return pipe(source, switchMap((value) => pipe(timeout(milliseconds), map(() => value))));
  };
}
