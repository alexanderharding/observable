import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@observable/internal";

/**
 * Ignores all [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { ignoreElements } from "@observable/ignore-elements";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3, 4, 5], ofIterable()), ignoreElements()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "return"
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
