import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Catches errors from the source observable and emits a new observable with the resolved value.
 */
export function catchError<Value, ResolvedValue>(
  resolver: (value: unknown) => Observable<ResolvedValue>,
): (source: Observable<Value>) => Observable<Value | ResolvedValue> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof resolver !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function catchErrorFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(value),
        return: () => observer.return(),
        throw: (value) => toObservable(resolver(value)).subscribe(observer),
      })
    );
  };
}
