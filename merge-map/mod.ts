import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each [source](https://jsr.io/@observable/core#source) value to an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { mergeMap } from "@observable/merge-map";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observableLookup = {
 *   1: of([1, 2, 3]),
 *   2: of([4, 5, 6]),
 *   3: of([7, 8, 9]),
 * } as const;
 * pipe(of([1, 2, 3]), mergeMap((value) => observableLookup[value])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "next" 2
 * // "next" 3
 * // "next" 4
 * // "next" 5
 * // "next" 6
 * // "next" 7
 * // "next" 8
 * // "next" 9
 * // "return"
 * ```
 */
export function mergeMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }

  return function mergeMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) => {
      let index = 0;
      let outerSubscriptionHasReturned = false;
      let activeInnerSubscriptions = 0;

      source.subscribe({
        signal: observer.signal,
        next(value) {
          activeInnerSubscriptions++;
          project(value, index++).subscribe({
            signal: observer.signal,
            next: (value) => observer.next(value),
            return() {
              if (!--activeInnerSubscriptions && outerSubscriptionHasReturned) {
                observer.return();
              }
            },
            throw: (value) => observer.throw(value),
          });
        },
        return() {
          outerSubscriptionHasReturned = true;
          if (activeInnerSubscriptions === 0) observer.return();
        },
        throw: (value) => observer.throw(value),
      });
    });
  };
}
