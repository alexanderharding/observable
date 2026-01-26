import { isObservable, Observable, Subject, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { finalize } from "@observable/finalize";
import { defer } from "@observable/defer";

/**
 * Shares a single [subscription](https://jsr.io/@observable/core#subscription) to the
 * [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and projects
 * it to all [consumers](https://jsr.io/@observable/core#consumer) through a
 * [`Subject`](https://jsr.io/@observable/core/doc/~/Subject). Resets when all
 * [unsubscribe](https://jsr.io/@observable/core@0.3.0/doc/~/Observer.signal) or when the
 * [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s or
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s.
 * @example
 * ```ts
 * import { share } from "@observable/share";
 * import { timeout } from "@observable/timeout";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const shared = pipe(timeout(1_000), share());
 *
 * // Both consumers share the same timeout — it only runs once.
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
 *
 * @example
 * Using ReplaySubject to buffer values for consumers that join mid-stream:
 * ```ts
 * import { share } from "@observable/share";
 * import { ReplaySubject } from "@observable/replay-subject";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const source = new Subject<number>();
 * const shared = pipe(source, share(() => new ReplaySubject<number>(1)));
 *
 * shared.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("1st", value),
 *   return: () => console.log("1st return"),
 *   throw: (value) => console.log("1st throw", value),
 * });
 *
 * source.next(1);
 * source.next(2);
 *
 * // A second consumer joins and receives the last buffered value (2) immediately.
 * shared.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("2nd", value),
 *   return: () => console.log("2nd return"),
 *   throw: (value) => console.log("2nd throw", value),
 * });
 *
 * source.next(3);
 * source.return();
 *
 * // Console output:
 * // "1st" 1
 * // "1st" 2
 * // "2nd" 2
 * // "1st" 3
 * // "2nd" 3
 * // "1st return"
 * // "2nd return"
 * ```
 */
export function share<Value>(
  connector = (): Subject<NoInfer<Value>> => new Subject(),
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
