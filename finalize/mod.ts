import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * The [producer](https://jsr.io/@observable/core#producer) is notifying the [consumer](https://jsr.io/@observable/core#consumer)
 * that it's done [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing, values for any reason, and will send no more values. Finalization,
 * if it occurs, will always happen as a side-effect _after_ [`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw), or [`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal) (whichever comes last).
 * @example
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3]), finalize(() => console.log("finalized"))).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * // "finalized"
 * ```
 */
export function finalize<Value>(
  finalizer: () => void,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof finalizer !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function finalizeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) => {
      const observerAbortListenerController = new AbortController();
      observer.signal.addEventListener("abort", () => finalizer(), {
        once: true,
        signal: observerAbortListenerController.signal,
      });
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(value),
        return() {
          observerAbortListenerController.abort();
          observer.return();
          finalizer();
        },
        throw(value) {
          observerAbortListenerController.abort();
          observer.throw(value);
          finalizer();
        },
      });
    });
  };
}
