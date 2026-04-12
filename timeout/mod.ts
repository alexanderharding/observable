import { Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { of } from "@observable/of";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a `void` value after the given number of
 * {@linkcode milliseconds} and then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
 * Positive integer milliseconds
 * ```ts
 * import { timeout } from "@observable/timeout";
 *
 * const controller = new AbortController();
 * timeout(1_000).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" undefined
 * // "return"
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { timeout } from "@observable/timeout";
 *
 * const controller = new AbortController();
 * timeout(0).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "next" undefined
 * // "return"
 * ```
 * @example
 * Negative integer milliseconds
 * ```ts
 * import { timeout } from "@observable/timeout";
 *
 * const controller = new AbortController();
 * timeout(-1).subscribe({
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
 * import { timeout } from "@observable/timeout";
 *
 * const controller = new AbortController();
 * timeout(NaN).subscribe({
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
 * Infinity milliseconds
 * ```ts
 * import { timeout } from "@observable/timeout";
 *
 * const controller = new AbortController();
 * timeout(Infinity).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // No `next`, `return`, or `throw` until the subscription is aborted (`never`).
 * controller.abort();
 * ```
 */
export function timeout(milliseconds: number): Observable<void> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return of(undefined);
  if (milliseconds === Infinity) return never;
  return pipe(
    new Observable<void>((observer) => {
      const timeout = setTimeout(() => observer.next(), milliseconds);
      observer.signal.addEventListener("abort", () => clearTimeout(timeout), { once: true });
    }),
    take(1),
  );
}
