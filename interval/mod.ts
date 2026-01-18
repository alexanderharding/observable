import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { Observable } from "@observable/core";
import { defer } from "@observable/defer";
import { map } from "@observable/map";
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { empty } from "@observable/empty";
import { never } from "@observable/never";

/**
 * @internal Do NOT export.
 */
const indexes = pipe(
  defer(() => of(generateInfiniteVoid())),
  map((_, index) => index),
);

/**
 * Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that emits an index value after a specific
 * number of {@linkcode milliseconds}, repeatedly.
 * @example
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
 * // "next" 0
 * // Console output (after 2 seconds):
 * // "next" 1
 * // Console output (after 3 seconds):
 * // "next" 2
 * // "return"
 * ```
 */
export function interval(milliseconds: number): Observable<number> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof milliseconds !== "number") {
    throw new ParameterTypeError(0, "Number");
  }
  if (milliseconds < 0 || Number.isNaN(milliseconds)) return empty;
  if (milliseconds === 0) return indexes;
  if (milliseconds === Infinity) return never;
  return pipe(
    new Observable<void>((observer) => {
      const interval = globalThis.setInterval(
        () => observer.next(),
        milliseconds,
      );
      observer.signal.addEventListener(
        "abort",
        () => globalThis.clearInterval(interval),
        { once: true },
      );
    }),
    map((_, index) => index),
  );
}

/**
 * @internal Do NOT export.
 */
function* generateInfiniteVoid(): Generator<void, void, void> {
  while (true) yield;
}
