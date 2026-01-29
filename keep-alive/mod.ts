import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

const { signal: noopSignal } = new AbortController();

/**
 * Ignores [`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal) indefinitely.
 * @example
 * ```ts
 * import { keepAlive } from "@observable/keep-alive";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3], ofIterable(), keepAlive()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => {
 *     console.log("next", value);
 *     if (value === 2) controller.abort(); // Ignored
 *   },
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 */
export function keepAlive<Value>(): (
  source: Observable<Value>,
) => Observable<Value> {
  return function keepAliveFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: noopSignal,
        next: (value) => observer.next(value),
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      })
    );
  };
}
