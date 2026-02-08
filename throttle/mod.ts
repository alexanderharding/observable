import { isObservable, type Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { exhaustMap } from "@observable/exhaust-map";
import { filter } from "@observable/filter";
import { flat } from "@observable/flat";
import { ofIterable } from "@observable/of-iterable";
import { timeout } from "@observable/timeout";
import { drop } from "@observable/drop";

/**
 * Throttles the [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * by the specified number of {@linkcode milliseconds}.
 * @example
 * ```ts
 * import { throttle } from "@observable/throttle";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 *
 * pipe(source, throttle(100)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source.next(1); // Emitted immediately
 * source.next(2); // Ignored (within throttle window)
 * source.next(3); // Ignored (within throttle window)
 *
 * // After 100ms, the next value will be emitted
 * source.next(4); // Emitted after throttle window
 *
 * // Console output:
 * // "next" 1
 * // (after 100ms)
 * // "next" 4
 * ```
 */
export function throttle<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  return function throttleFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, filter((_, index) => index === 0));
    if (milliseconds === 0) return pipe(source, asObservable());
    return pipe(
      source,
      exhaustMap((value) =>
        flat([pipe([value], ofIterable()), pipe(timeout(milliseconds), drop<never>(Infinity))])
      ),
    );
  };
}
