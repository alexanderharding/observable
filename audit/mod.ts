import { isObservable, type Observable, Subject } from "@observable/core";
import { from } from "@observable/from";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { timeout } from "@observable/timeout";
import { defer } from "@observable/defer";
import { map } from "@observable/map";
import { exhaustMap } from "@observable/exhaust-map";
import { tap } from "@observable/tap";
import { drop } from "@observable/drop";
import { until } from "@observable/until";

/**
 * Flag indicating that no value has been emitted yet.
 * @internal Do NOT export.
 */
const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * [Pushes](https://jsr.io/@observable/core#push) the latest {@linkcode Value|value} when an auditing window of {@linkcode milliseconds} elapses.
 * @example
 * 100 milliseconds
 * ```ts
 * import { audit } from "@observable/audit";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 *
 * pipe(subject, audit(100)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1);
 * subject.next(2);
 * subject.next(3);
 *
 * // Console output (after 100ms):
 * // "next" 3
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { audit } from "@observable/audit";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), audit(0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "return"
 * ```
 * @example
 * Negative milliseconds
 * ```ts
 * import { audit } from "@observable/audit";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), audit(-1)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 * @example
 * NaN milliseconds
 * ```ts
 * import { audit } from "@observable/audit";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), audit(NaN)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "return"
 * ```
 * @example
 * Infinite milliseconds
 * ```ts
 * import { audit } from "@observable/audit";
 * import { Subject } from "@observable/core";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const subject = new Subject<number>();
 *
 * pipe(subject, audit(Infinity)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * subject.next(1);
 * subject.next(2);
 * subject.return();
 *
 * // Console output (synchronously):
 * // "next" 1
 * // "return"
 * ```
 */
export function audit<Value>(
  milliseconds: number,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  return function auditFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");

    if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
    if (milliseconds === Infinity) return pipe(source, drop<never>(Infinity));
    if (milliseconds === 0) return from(source);

    return defer(() => {
      /**
       * Tracking the latest value to be pushed when the auditing window elapses.
       */
      let pending: Value | typeof noValue = noValue;
      /**
       * Closing the auditing window as a value is pushed to the consumer to open a new window
       * if a reentrant value is pushed from the source.
       */
      const close = new Subject<void>();
      return pipe(
        source,
        tap((value) => (pending = value)),
        exhaustMap(() => pipe(timeout(milliseconds), map(() => pending), until(close))),
        tap(() => close.next()),
      );
    });
  };
}
