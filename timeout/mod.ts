import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { of } from "@observable/of";
import { never } from "@observable/never";
import { flat } from "@observable/flat";

/**
 * @internal Do NOT export.
 */
const success = of([0]);

/**
 * Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a successful execution
 * code (`0`) after a specified number of {@linkcode milliseconds} and then
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.
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
 * // "next" 0
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
 * // "next" 0
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
export function timeout(milliseconds: number): Observable<0> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return success;
  if (milliseconds === Infinity) return never;
  return flat([
    new Observable<never>((observer) => {
      const timeout = globalThis.setTimeout(
        () => observer.return(),
        milliseconds,
      );
      observer.signal.addEventListener(
        "abort",
        () => globalThis.clearTimeout(timeout),
        { once: true },
      );
    }),
    success,
  ]);
}
