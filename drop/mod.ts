import { isObservable, type Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";
import { pipe } from "@observable/pipe";
import { filter } from "@observable/filter";

/**
 * Drops the first {@linkcode count} of [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * values from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { drop } from "@observable/drop";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3, 4, 5], ofIterable(), drop(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "return"
 * ```
 */
export function drop<Value>(
  count: number,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof count !== "number") throw new ParameterTypeError(0, "Number");
  return function dropFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (count < 0 || Number.isNaN(count) || count === Infinity) return empty;
    return pipe(
      source,
      count === 0 ? toObservable : filter((_, index) => index >= count),
    );
  };
}
