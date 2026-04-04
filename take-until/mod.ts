import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";
import { ParameterTypeError } from "@observable/internal";

/**
 * Takes [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@observable/core#source) until [notified](https://jsr.io/@observable/core#notifier)
 * to [`return`](https://jsr.io/@observable/core/doc/~/Observer.return).
 * @example
 * ```ts
 * import { Subject } from "@observable/core";
 * import { takeUntil } from "@observable/take-until";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 * const notifier = new Subject<void>();
 *
 * pipe(source, takeUntil(notifier)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * source.next(1); // "next" 1
 * source.next(2); // "next" 2
 * notifier.next(); // "return"
 * source.next(3);
 * source.return();
 * ```
 */
export function takeUntil<Value>(
  notifier: Observable,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isObservable(notifier)) throw new ParameterTypeError(0, "Observable");
  notifier = from(notifier);
  return function takeUntilFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return new Observable((observer) => {
      notifier.subscribe({
        signal: observer.signal,
        next: () => observer.return(),
        return: () => {},
        throw: (value) => observer.throw(value),
      });
      source.subscribe(observer);
    });
  };
}
