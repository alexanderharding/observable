import { isObservable, Observable } from "@observable/core";
import { ParameterTypeError } from "@observable/internal";
import {
  from as rxJsFrom,
  isObservable as isRxJsObservable,
  Observable as RxJsObservable,
  type Observer as RxJsObserver,
  Subscriber,
} from "rxjs";
import { from } from "@observable/from";

/**
 * Converts an [RxJS Observable](https://rxjs.dev/api/index/class/Observable) to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { asObservable } from "@observable/rxjs-interop";
 * import { of as rxJsOf } from "rxjs";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observable = pipe(rxJsOf(1, 2, 3), asObservable());
 * observable.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 */
export function asObservable<Value>(): (source: RxJsObservable<Value>) => Observable<Value> {
  return function asObservableFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isRxJsObservable(source)) throw new ParameterTypeError(0, "RxJsObservable");
    return new Observable((observer) => {
      // Create a new subscriber to manually before subscribing to the source so we have precise
      // control over teardown timing which is crucial to prevent reentrancy issues. We'll swap
      // the deprecated Subscriber constructor with the new "operate" function when it lands in RxJS v8.
      const subscriber = new Subscriber(
        {
          next: (value) => observer.next(value),
          complete: () => observer.return(),
          error: (value: unknown) => observer.throw(value),
        } satisfies RxJsObserver<Value>,
      );
      observer.signal.addEventListener("abort", () => subscriber.unsubscribe(), { once: true });
      rxJsFrom(source).subscribe(subscriber);
    });
  };
}

/**
 * Converts an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an [RxJS Observable](https://rxjs.dev/api/index/class/Observable).
 * @example
 * ```ts
 * import { asRxJsObservable } from "@observable/rxjs-interop";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observable = pipe(forOf([1, 2, 3]), asRxJsObservable());
 * const subscription = observable.subscribe({
 *   next: (value) => console.log("next", value),
 *   complete: () => console.log("complete"),
 *   error: (value) => console.error("error", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "complete"
 * ```
 */
export function asRxJsObservable<Value>(): (source: Observable<Value>) => RxJsObservable<Value> {
  return function asRxJsObservableFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    return new RxJsObservable((subscriber) => {
      if (subscriber.closed) return;
      const activeSubscriptionController = new AbortController();
      from(source).subscribe({
        signal: activeSubscriptionController.signal,
        next: (value) => subscriber.next(value),
        return: () => subscriber.complete(),
        throw: (value) => subscriber.error(value),
      });
      return () => activeSubscriptionController.abort();
    });
  };
}
