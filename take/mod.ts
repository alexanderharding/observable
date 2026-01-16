import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * Takes the first {@linkcode count} values [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * by the [source](https://jsr.io/@observable/core#source).
 * @example
 * ```ts
 * import { take } from "@observable/take";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3, 4, 5]), take(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // console output:
 * // "next" 1
 * // "next" 2
 * // "return"
 * ```
 */
export function take<Value>(
  count: number,
): (source: Observable<Value>) => Observable<Value> {
  return function takeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    if (count <= 0 || Number.isNaN(count)) return empty;
    source = toObservable(source);
    if (count === Infinity) return source;
    return new Observable((observer) => {
      let seen = 0;
      source.subscribe({
        signal: observer.signal,
        next(value) {
          if (++seen > count) return;
          observer.next(value);
          if (count <= seen) observer.return();
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
