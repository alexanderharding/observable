import { isObservable, Observable, Subject } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { finalize } from "@observable/finalize";
import { defer } from "@observable/defer";

/**
 * Shares a single [consumer](https://jsr.io/@observable/core#consumer) of the
 * [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable), forwarding
 * [`notifications`](https://jsr.io/@observable/core#notification) to all
 * [consumers](https://jsr.io/@observable/core#consumer) of the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) through a
 * [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) created by a
 * {@linkcode factory} function. Resets on [`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw), or when on all
 * [consumers](https://jsr.io/@observable/core#consumer)
 * [abort](https://jsr.io/@observable/core/doc/~/Observer.signal).
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
  factory: () => Subject<NoInfer<Value>> = () => new Subject(),
): (source: Observable<Value>) => Observable<Value> {
  if (typeof factory !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function shareFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    let activeObservers = 0;
    let shared: Observable<Value> | undefined;
    source = pipe(source, asObservable());
    return pipe(
      defer(() => {
        ++activeObservers;
        if (isObservable(shared)) return shared;
        return new Observable((observer) => {
          const subject = factory();
          (shared = pipe(subject, asObservable())).subscribe(observer);
          source.subscribe(subject);
        });
      }),
      finalize(() => --activeObservers === 0 && (shared = undefined)),
    );
  };
}
