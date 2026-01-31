import { isObservable, type Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { defer } from "@observable/defer";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";
import { filter } from "@observable/filter";

/**
 * Flag indicating that no value has been emitted yet.
 * @internal Do NOT export.
 */
const noValue = Symbol("Flag indicating that no value has been emitted yet");

/**
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s pairs of consecutive values
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
) => Observable<Readonly<[previous: Value, current: Value]>> {
  return function pairwiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return defer(() => {
      let previous: Value | typeof noValue = noValue;
      return pipe(
        source,
        filter((current) => {
          const isFirst = previous === noValue;
          if (isFirst) previous = current;
          return !isFirst;
        }),
        map((current) => {
          const pair = [previous, current] as const;
          previous = current;
          return pair;
        }),
      );
    });
  };
}
