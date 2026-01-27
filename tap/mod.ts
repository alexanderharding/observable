import {
  isObservable,
  isObserver,
  Observable,
  type Observer,
  toObservable,
  toObserver,
} from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Performs side-effects on the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { tap } from "@observable/tap";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const subscriptionController = new AbortController();
 * const tapController = new AbortController();
 *
 * pipe(
 *   of([1, 2, 3]),
 *   tap({
 *     signal: tapController.signal,
 *     next(value) {
 *       if (value === 2) tapController.abort();
 *       console.log("tap next", value);
 *     },
 *     return: () => console.log("tap return"),
 *     throw: (value) => console.log("tap throw", value),
 *   })
 * ).subscribe({
 *   signal: subscriptionController.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap next" 1
 * // "next" 1
 * // "tap next" 2
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 */
export function tap<Value>(
  observer: Observer<Value>,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
  const tapObserver = toObserver(observer);
  return function tapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next(value) {
          tapObserver.next(value);
          observer.next(value);
        },
        return() {
          tapObserver.return();
          observer.return();
        },
        throw(value) {
          tapObserver.throw(value);
          observer.throw(value);
        },
      })
    );
  };
}
