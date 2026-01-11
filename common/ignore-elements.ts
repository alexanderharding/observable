import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@xan/observable-internal";

/**
 * Ignores all [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@xan/observable-core#source).
 * @example
 * ```ts
 * import { ignoreElements, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), ignoreElements()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // return
 * ```
 */
export function ignoreElements<Value>(): (
  source: Observable<Value>,
) => Observable<never> {
  return function ignoreElementsFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: noop,
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      })
    );
  };
}
