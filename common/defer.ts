import { Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";

/**
 * Creates an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that, on
 * [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe), calls an
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) {@linkcode factory} to
 * get an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) for each
 * [`Observer`](https://jsr.io/@xan/observable-core/doc/~/Observer).
 */
export function defer<Value>(
  factory: () => Observable<Value>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof factory !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return new Observable((observer) => pipe(factory(), asObservable()).subscribe(observer));
}
