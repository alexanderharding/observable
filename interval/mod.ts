import { Observable } from "@observable/core";
import { defer } from "@observable/defer";
import { forOf } from "@observable/for-of";
import { empty } from "@observable/empty";
import { never } from "@observable/never";

/**
 * @internal Do NOT export.
 */
const infiniteVoid = defer(() => forOf(generateInfiniteVoid()));

/**
 * Repeatedly [pushes](https://jsr.io/@observable/core#push) a `void` value at an interval of the given {@linkcode milliseconds}.
 * @example
 * Positive integer milliseconds
 * ```ts
 * import { interval } from "@observable/interval";
 * import { take } from "@observable/take";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(interval(1000), take(3)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" undefined
 * // Console output (after 2 seconds):
 * // "next" undefined
 * // Console output (after 3 seconds):
 * // "next" undefined
 * // "return"
 * ```
 * @example
 * 0 milliseconds
 * ```ts
 * import { interval } from "@observable/interval";
 * import { take } from "@observable/take";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(interval(0), take(3)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (synchronously):
 * // "next" undefined
 * // "next" undefined
 * // "next" undefined
 * // "return"
 * ```
 * @example
 * Negative integer milliseconds
 * ```ts
 * import { interval } from "@observable/interval";
 *
 * const controller = new AbortController();
 * interval(-1).subscribe({
 *   signal: controller.signal,
 *   next: () => console.log("next"),
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
 * import { interval } from "@observable/interval";
 *
 * const controller = new AbortController();
 * interval(NaN).subscribe({
 *   signal: controller.signal,
 *   next: () => console.log("next"),
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
 * import { interval } from "@observable/interval";
 *
 * const controller = new AbortController();
 * interval(Infinity).subscribe({
 *   signal: controller.signal,
 *   next: () => console.log("next"),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // No console output
 * ```
 */
export function interval(milliseconds: number): Observable<void> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof milliseconds !== "number") throw new TypeError("Parameter 1 is not of type 'Number'");
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return infiniteVoid;
  if (milliseconds === Infinity) return never;
  return new Observable<void>((observer) => {
    const interval = setInterval(() => observer.next(), milliseconds);
    observer.signal.addEventListener("abort", () => clearInterval(interval), { once: true });
  });
}

/**
 * @internal Do NOT export.
 */
function* generateInfiniteVoid(): Generator<void, void, void> {
  while (true) yield;
}
