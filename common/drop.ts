import { isObservable, type Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { empty } from "./empty.ts";
import { pipe } from "./pipe.ts";
import { filter } from "./filter.ts";
import { asObservable } from "./as-observable.ts";

/**
 * Drops the first {@linkcode count} values [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed
 * by the [source](https://jsr.io/@xan/observable-core#source).
 * @example
 * ```ts
 * import { drop, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), drop(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 3
 * // 4
 * // 5
 * // return
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
      count === 0 ? asObservable() : filter((_, index) => index >= count),
    );
  };
}
