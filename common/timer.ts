import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { Observable } from "@xan/observable-core";
import { empty } from "./empty.ts";
import { of } from "./of.ts";
import { never } from "./never.ts";
import { flat } from "./flat.ts";

/**
 * @internal Do NOT export.
 */
const success = of([0]);

/**
 * Creates an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)s a `0` value after a
 * specified number of {@linkcode milliseconds} and then
 * [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return)s.
 * @example
 * ```ts
 * import { timer } from "@xan/observable-common";
 *
 * timer(1_000).subscribe({
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output (after 1 second):
 * // "next" 0
 * // "return"
 * ```
 */
export function timer(milliseconds: number): Observable<0> {
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
