import { isObservable, Observable, toObservable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import type { ObserverNotification } from "./observer-notification.ts";

/**
 * Converts an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) of
 * {@linkcode ObserverNotification|notification} objects into the emissions
 * that they represent.
 */
export function dematerialize<Value>(): (
  source: Observable<ObserverNotification<Value>>,
) => Observable<Value> {
  return function dematerializeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next(value) {
          switch (value[0]) {
            case "next":
              observer.next(value[1]);
              break;
            case "return":
              observer.return();
              break;
            case "throw":
              observer.throw(value[1]);
              break;
            default:
              observer.throw(new ParameterTypeError(0, "ObserverNotification"));
              break;
          }
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      })
    );
  };
}
