import { isObservable, Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Converts a custom [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a proper
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If the [source](https://jsr.io/@observable/core#source) is
 * already an instanceof [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * (which means it has [`Observable.prototype`](https://jsr.io/@observable/core/doc/~/ObservableConstructor.prototype)
 * in its prototype chain), it's returned directly. Otherwise, a new [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * object is created that wraps the original [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { Observable } from "@observable/core";
 * import { asObservable } from "@observable/as-observable";
 * import { pipe } from "@observable/pipe";
 *
 * const observableInstance = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 * const result = pipe(observableInstance, asObservable());
 *
 * result === observableInstance; // true
 * result instanceof Observable; // true
 * ```
 * @example
 * ```ts
 * import { Observable } from "@observable/core";
 * import { asObservable } from "@observable/as-observable";
 * import { pipe } from "@observable/pipe";
 *
 * const customObservable: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * const result = pipe(customObservable, asObservable());
 *
 * result === customObservable; // false
 * result instanceof Observable; // true
 * ```
 */
export function asObservable<Value>(): (
  source: Observable<Value>,
) => Observable<Value>;
export function asObservable<Value>(): (
  source: Pick<Observable<Value>, keyof Observable<Value>>,
) => Observable<Value> {
  return function asObservableFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (source instanceof Observable) return source;
    return new Observable((observer) => source.subscribe(observer));
  };
}
