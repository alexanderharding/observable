import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";

/**
 * {@linkcode project|Projects} each source value to an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable)
 * which is merged in the output [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable).
 */
export function mergeMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }

  return function mergeMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) => {
      let index = 0;
      let outerSubscriptionHasReturned = false;
      let activeInnerSubscriptions = 0;

      source.subscribe({
        signal: observer.signal,
        next(value) {
          activeInnerSubscriptions++;
          toObservable(project(value, index++)).subscribe({
            signal: observer.signal,
            next: (value) => observer.next(value),
            return() {
              if (!--activeInnerSubscriptions && outerSubscriptionHasReturned) {
                observer.return();
              }
            },
            throw: (value) => observer.throw(value),
          });
        },
        return() {
          outerSubscriptionHasReturned = true;
          if (activeInnerSubscriptions === 0) observer.return();
        },
        throw: (value) => observer.throw(value),
      });
    });
  };
}
