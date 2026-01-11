import { isObservable, Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";

/**
 * Filters [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@xan/observable-core#source) that satisfy a specified {@linkcode predicate}.
 * @example
 * ```ts
 * import { filter, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), filter((value) => value % 2 === 0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log(value),
 * });
 *
 * // console output:
 * // 2
 * // 4
 * // return
 * ```
 */
export function filter<Value>(
  predicate: (value: Value, index: number) => boolean,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof predicate !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function filterFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return new Observable((observer) => {
      let index = 0;
      source.subscribe({
        signal: observer.signal,
        next: (value) => predicate(value, index++) && observer.next(value),
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
