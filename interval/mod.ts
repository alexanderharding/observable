import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { Observable } from "@observable/core";
import { defer } from "@observable/defer";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";
import { never } from "@observable/never";

/**
 * @internal Do NOT export.
 */
const infiniteVoid = defer(() => pipe(generateInfiniteVoid(), ofIterable()));

/**
 * Repeatedly [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a `void` value with a
 * fixed {@linkcode milliseconds|time delay} between each call.
 * @example
 * ```ts
 * import { interval } from "@observable/interval";
 * import { take } from "@observable/take";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(interval(1000), take(3)).subscribe({
 *   signal: controller.signal,
 *   next: () => console.log("next"),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next"
 * // Console output (after 2 seconds):
 * // "next"
 * // Console output (after 3 seconds):
 * // "next"
 * // "return"
 * ```
 */
export function interval(milliseconds: number): Observable<void> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") throw new ParameterTypeError(0, "Number");
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return infiniteVoid;
  if (milliseconds === Infinity) return never;
  return new Observable<void>((observer) => {
    const interval = globalThis.setInterval(() => observer.next(), milliseconds);
    observer.signal.addEventListener(
      "abort",
      () => globalThis.clearInterval(interval),
      { once: true },
    );
  });
}

/**
 * @internal Do NOT export.
 */
function* generateInfiniteVoid(): Generator<void, void, void> {
  while (true) yield;
}
