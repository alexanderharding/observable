import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";

/**
 * The [producer](https://jsr.io/@xan/observable-core#producer) is notifying the [consumer](https://jsr.io/@xan/observable-core#consumer)
 * that it's done [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ing, values for any reason, and will send no more values. Finalization,
 * if it occurs, will always happen as a side-effect _after_ [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return),
 * [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw), or [`unsubscribe`](https://jsr.io/@xan/observable-core/doc/~/Observer.signal) (whichever comes last).
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
