import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Filters [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values from the
 * [source](https://jsr.io/@observable/core#source) that satisfy a specified {@linkcode predicate}.
 * @example
 * ```ts
 * import { filter } from "@observable/filter";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), filter((value) => value % 2 === 0)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 2
 * // "next" 4
 * // "return"
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
    source = toObservable(source);
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
