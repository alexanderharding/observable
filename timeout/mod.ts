import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { Observable } from "@observable/core";
import { empty } from "@observable/empty";
import { ofIterable } from "@observable/of-iterable";
import { never } from "@observable/never";
import { pipe } from "@observable/pipe";

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
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return pipe([undefined], ofIterable());
  if (milliseconds === Infinity) return never;
  return new Observable((observer) => {
    const timeout = globalThis.setTimeout(
      () => {
        observer.next();
        observer.return();
      },
      milliseconds,
    );
    observer.signal.addEventListener(
      "abort",
      () => globalThis.clearTimeout(timeout),
      { once: true },
    );
  });
}
