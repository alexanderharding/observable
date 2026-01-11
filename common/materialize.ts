import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import type { ObserverNotification } from "./observer-notification.ts";

/**
 * Represents all of the {@linkcode ObserverNotification|notifications} from the `source` [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) as
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) emissions marked with their original types within
 * {@linkcode ObserverNotification|notification} entries.
 * @example <caption>An Observable that emits values and then returns</caption>
 * ```ts
 * import { materialize, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3]), materialize()).subscribe({
 *  signal: controller.signal,
 *  next: (value) => console.log(value),
 *  return: () => console.log("return"),
 *  throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // ["N", 1]
 * // ["N", 2]
 * // ["N", 3]
 * // ["R"]
 * // "return"
 * ```
 * @example <caption>An Observable that throws</caption>
 * ```ts
 * import { throwError, of, materialize, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(throwError(new Error("error")), materialize()).subscribe({
 *  signal: controller.signal,
 *  next: (value) => console.log("next", value),
 *  return: () => console.log("return"),
 *  throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // ["T", new Error("error")]
 * // "return"
 * ```
 */
export function materialize<Value>(): (
  source: Observable<Value>,
) => Observable<ObserverNotification<Value>> {
  return function materializeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(["N", value]),
        return() {
          observer.next(["R"]);
          observer.return();
        },
        throw(value) {
          observer.next(["T", value]);
          observer.return();
        },
      })
    );
  };
}
