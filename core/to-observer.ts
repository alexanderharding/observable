import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { Observer } from "./observer.ts";
import { isObserver } from "./is-observer.ts";

/**
 * Converts a custom {@linkcode Observer} to a proper {@linkcode Observer}. If the {@linkcode value} is
 * already an instanceof {@linkcode Observer} (which means it has {@linkcode Observer.prototype}
 * in its prototype chain), it's returned directly. Otherwise, a new {@linkcode Observer} object is created
 * that wraps the original {@linkcode value}.
 * @example
 * ```ts
 * import { toObserver, Observer } from "@xan/observable-core";
 *
 * const instance = new Observer((value) => {
 *   // Implementation omitted for brevity.
 * });
 * const result = toObserver(instance);
 *
 * console.log(result === instance); // true
 * console.log(result instanceof Observer); // true
 * ```
 * @example
 * ```ts
 * import { toObserver, Observer } from "@xan/observable-core";
 *
 * const custom: Observer = {
 *   signal: new AbortController().signal,
 *   next(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   return() {
 *     // Implementation omitted for brevity.
 *   },
 *   throw(value) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 * const result = toObserver(custom);
 *
 * console.log(result === custom); // false
 * console.log(result instanceof Observer); // true
 * ```
 */
export function toObserver<Value>(value: Observer<Value>): Observer<Value>;
export function toObserver(value: Pick<Observer, keyof Observer>): Observer {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObserver(value)) throw new ParameterTypeError(0, "Observer");
  return value instanceof Observer ? value : new Observer(value);
}
