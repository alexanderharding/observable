import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { fromIterable } from "@observable/from-iterable";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a `void` value after a specified number of
 * {@linkcode milliseconds} and then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
 * @example
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
 */
export function timeout(milliseconds: number): Observable<void> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") throw new ParameterTypeError(0, "Number");
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return fromIterable([void 0]);
  if (milliseconds === Infinity) return never;
  return pipe(
    new Observable<void>((observer) => {
      const timeout = setTimeout(() => observer.next(), milliseconds);
      observer.signal.addEventListener("abort", () => clearTimeout(timeout), {
        once: true,
      });
    }),
    take(1),
  );
}
