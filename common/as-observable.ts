import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { isObservable, type Observable, toObservable } from "@xan/observable-core";

/**
 * Converts a custom [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) to a proper
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable). If the [source](https://jsr.io/@xan/observable-core#source) is
 * already an instanceof [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) (which means it has
 * [`Observable.prototype`](https://jsr.io/@xan/observable-core/doc/~/ObservableConstructor.prototype) in its prototype chain),
 * it's returned directly. Otherwise, a new [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) object is created
 * that wraps the original [source](https://jsr.io/@xan/observable-core#source).
 */
export function asObservable<Value>(): (
  source: Observable<Value>,
) => Observable<Value> {
  return function asObservableFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    return toObservable(source);
  };
}
