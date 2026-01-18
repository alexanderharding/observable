import { MinimumArgumentsRequiredError } from "@observable/internal";
import { Subject } from "./subject.ts";
import { isObservable } from "./is-observable.ts";
import { isObserver } from "./is-observer.ts";

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Subject} interface.
 * @example
 * ```ts
 * import { isSubject, Subject } from "@observable/core";
 *
 * const subjectInstance = new Subject();
 * isSubject(subjectInstance); // true
 *
 * const subjectLiteral: Subject = {
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
 * isSubject(subjectLiteral); // true
 *
 * const notASubject = {};
 * isSubject(notASubject); // false
 * ```
 */
export function isSubject(value: unknown): value is Subject {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return value instanceof Subject || (isObservable(value) && isObserver(value));
}
