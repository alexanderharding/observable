import { isObservable, type Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";
import { scan } from "@observable/scan";

/**
 * Flag indicating that no value has been emitted yet.
 * @internal Do NOT export.
 */
const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * Object type that represents a pair of consecutive values.
 */
export type Pair<Value = unknown> = Readonly<[previous: Value, current: Value]>;

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s {@linkcode Pair|pair}s of consecutive values
 * from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { pairwise } from "@observable/pairwise";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3, 4], ofIterable(), pairwise()).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" [1, 2]
 * // "next" [2, 3]
 * // "next" [3, 4]
 * // "return"
 * ```
 */
export function pairwise<Value>(): (
  source: Observable<Value>,
) => Observable<Pair<Value>> {
  return function pairwiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    const seed: Pair<Value | typeof noValue> = [noValue, noValue];
    source = pipe(source, asObservable());
    return pipe(
      source,
      scan(([, previous], current) => [previous, current] as const, seed),
      filter((pair) => pair.every((value) => value !== noValue)),
    );
  };
}
