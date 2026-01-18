import { isObservable, Observable, Subject, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { finalize } from "@observable/finalize";
import { defer } from "@observable/defer";

/**
 * Converts an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a {@linkcode Observable} that shares
 * a single subscription to the source [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { share } from "@observable/share";
 * import { timer } from "@observable/timer";
 * import { pipe } from "@observable/pipe";
 *
 * const shared = pipe(timer(1_000), share());
 * const controller = new AbortController();
 * shared.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 * shared.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" 0
 * // "next" 0
 * // "return"
 * // "return"
 * ```
 */
export function share<Value>(
  connector = () => new Subject<NoInfer<Value>>(),
): (source: Observable<Value>) => Observable<Value> {
  if (typeof connector !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function shareFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    let activeSubscriptions = 0;
    let connection: Observable<Value> | undefined;
    source = toObservable(source);
    return pipe(
      defer(() => {
        ++activeSubscriptions;
        if (isObservable(connection)) return connection;
        return new Observable((observer) => {
          const subject = connector();
          (connection = toObservable(subject)).subscribe(observer);
          source.subscribe(subject);
        });
      }),
      finalize(() => --activeSubscriptions === 0 && (connection = undefined)),
    );
  };
}
