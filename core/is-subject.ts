import { Subject } from "./subject.ts";
import { isObservable } from "./is-observable.ts";
import { isObserver } from "./observer.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Subject} interface.
 * @example
 * Instance
 * ```ts
 * import { isSubject, Subject } from "@observable/core";
 *
 * const value = new Subject();
 *
 * isSubject(value); // true
 * ```
 * @example
 * Literal
 * ```ts
 * import { isSubject, Subject } from "@observable/core";
 *
 * const value: Subject = {
 *   signal: {
 *     aborted: false,
 *     onabort: null,
 *     throwIfAborted() {
 *       // Implementation omitted for brevity.
 *     },
 *     addEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     removeEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     dispatchEvent() {
 *       // Implementation omitted for brevity.
 *     },
 *   },
 *   next(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   return() {
 *     // Implementation omitted for brevity.
 *   },
 *   throw(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 *
 * isSubject(value); // true
 * ```
 * @example
 * Empty Object
 * ```ts
 * import { isSubject } from "@observable/core";
 *
 * const value = {};
 * isSubject(value); // false
 * ```
 * @example
 * Primitive
 * ```ts
 * import { isSubject } from "@observable/core";
 *
 * const value = 1;
 *
 * isSubject(value); // false
 * ```
 */
export function isSubject(value: unknown): value is Subject {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return value instanceof Subject || (isObservable(value) && isObserver(value));
}
