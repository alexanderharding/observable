import { isObservable } from "./is-observable.ts";
import { Observable } from "./observable.ts";

/**
 * Converts custom {@linkcode Observable|observables}, probably exported by libraries, to proper {@linkcode Observable|observables}. If the {@linkcode value} is already
 * instanceof {@linkcode Observable} (which means it has {@linkcode Observable.prototype} in it's prototype chain), it is returned directly. Otherwise, a
 * new {@linkcode Observable} object is created that wraps the original {@linkcode value}.
 */
export function from<Value>(value: Observable<Value>): Observable<Value>;
export function from(value: Pick<Observable, keyof Observable>): Observable {
  if (arguments.length === 0) {
    throw new TypeError("1 argument required but 0 present");
  }
  if (!isObservable(value)) {
    throw new TypeError("Parameter 1 is not of type 'Observable'");
  }
  return value instanceof Observable
    ? value
    : new Observable((observer) => value.subscribe(observer));
}
