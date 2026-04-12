import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * Takes {@linkcode Value|values} until the given {@linkcode notifier}
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a value.
 * @example
 * ```ts
 * import { Subject } from "@observable/core";
 * import { takeUntil } from "@observable/take-until";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 * const notifier = new Subject<void>();
 *
 * pipe(subject, takeUntil(notifier)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1); // "next" 1
 * subject.next(2); // "next" 2
 * notifier.next(); // "return"
 * subject.next(3);
 * subject.return();
 * ```
 */
export function takeUntil<Value>(
  notifier: Observable,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (!isObservable(notifier)) throw new TypeError("Parameter 1 is not of type 'Observable'");
  notifier = from(notifier);
  return function takeUntilFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
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
