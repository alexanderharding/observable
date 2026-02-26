import { isObservable, Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Converts a custom [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a proper
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable). If the provided {@linkcode value} is
 * already an instanceof [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * (which means it has [`Observable.prototype`](https://jsr.io/@observable/core/doc/~/ObservableConstructor.prototype)
 * in its prototype chain), it's returned directly. Otherwise, a new [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * object is created that wraps the original provided {@linkcode value}.
 * @example
 * ```ts
 * import { Observable } from "@observable/core";
 * import { from } from "@observable/from";
 *
 * const observableInstance = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 * const result = from(observableInstance);
 *
 * result === observableInstance; // true
 * result instanceof Observable; // true
 * ```
 * @example
 * ```ts
 * import { Observable } from "@observable/core";
 * import { from } from "@observable/from";
 *
 * const customObservable: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * const result = from(customObservable);
 *
 * result === customObservable; // false
 * result instanceof Observable; // true
 * ```
 */
export function from<Value>(value: Observable<Value>): Observable<Value>;
export function from<Value>(
  value: Pick<Observable<Value>, keyof Observable<Value>>,
): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(value)) throw new ParameterTypeError(0, "Observable");
  if (value instanceof Observable) return value;
  return new Observable((observer) => value.subscribe(observer));
}
