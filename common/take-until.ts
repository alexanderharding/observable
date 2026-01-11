import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, noop, ParameterTypeError } from "@xan/observable-internal";

/**
 * Takes [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values from the `source`
 * until the {@linkcode notifier} [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable)
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)s any value.
 * @example
 * ```ts
 * import { Subject } from "@xan/observable-core";
 * import { takeUntil, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 * const notifier = new Subject<void>();
 *
 * pipe(source, takeUntil(notifier)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * source.next(1);
 * source.next(2);
 * notifier.next();
 * source.next(3);
 * source.return();
 *
 * // console output:
 * // 1
 * // 2
 * // return
 * ```
 */
export function takeUntil<Value>(
  notifier: Observable,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(notifier)) throw new ParameterTypeError(0, "Observable");
  notifier = toObservable(notifier);
  return function takeUntilFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) => {
      notifier.subscribe({
        signal: observer.signal,
        next: () => observer.return(),
        return: noop,
        throw: (value) => observer.throw(value),
      });
      source.subscribe(observer);
    });
  };
}
