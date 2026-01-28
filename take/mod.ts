import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { empty } from "@observable/empty";

/**
 * Takes the first {@linkcode count} of [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * values from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { take } from "@observable/take";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3, 4, 5], ofIterable()), take(2)).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
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
      const controller = new AbortController();
      source.subscribe({
        signal: AbortSignal.any([observer.signal, controller.signal]),
        next(value) {
          const isLastValue = ++seen === count;
          if (isLastValue) controller.abort();
          observer.next(value);
          if (isLastValue) observer.return();
        },
        return: () => observer.return(),
        throw: (value) => observer.throw(value),
      });
    });
  };
}
