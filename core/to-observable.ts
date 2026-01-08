import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { isObservable } from "./is-observable.ts";
import { Observable } from "./observable.ts";

/**
 * Converts a custom {@linkcode Observable} to a proper {@linkcode Observable}. If the {@linkcode value} is
 * already an instanceof {@linkcode Observable} (which means it has {@linkcode Observable.prototype}
 * in its prototype chain), it's returned directly. Otherwise, a new {@linkcode Observable} object is created
 * that wraps the original {@linkcode value}.
 * @example
 * ```ts
 * import { toObservable, Observable } from "@xan/observable-core";
 *
 * const observableInstance = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 * const result = toObservable(observableInstance);
 *
 * result === observableInstance; // true
 * result instanceof Observable; // true
 * ```
 * @example
 * ```ts
 * import { toObservable, Observable } from "@xan/observable-core";
 *
 * const customObservable: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * const result = toObservable(customObservable);
 *
 * result === customObservable; // false
 * result instanceof Observable; // true
 * ```
 */
export function toObservable<Value>(
  value: Observable<Value>,
): Observable<Value>;
export function toObservable(
  value: Pick<Observable, keyof Observable>,
): Observable {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(value)) throw new ParameterTypeError(0, "Observable");
  return value instanceof Observable
    ? value
    : new Observable((observer) => value.subscribe(observer));
}
