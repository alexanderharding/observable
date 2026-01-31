import { isObservable, type Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { scan } from "@observable/scan";
import { pipe } from "@observable/pipe";
import { share } from "@observable/share";
import { AsyncSubject } from "@observable/async-subject";
import { defer } from "@observable/defer";

/**
 * Applies an {@linkcode accumulator} function over each
 * [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value,
 * and [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s only
 * the final accumulated value (if any) when the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { reduce } from "@observable/reduce";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = pipe([1, 2, 3], ofIterable());
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
  accumulator: (previous: Out, current: In, index: number) => Out,
  seed: Out,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof accumulator !== "function") throw new ParameterTypeError(0, "Function");
  return function reduceFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return defer(() => pipe(source, scan(accumulator, seed), share(() => new AsyncSubject())));
  };
}
