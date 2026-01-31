import { isObservable, Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * value from the [source](https://jsr.io/@observable/core#source)
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s.
 * @example
 * ```ts
 * import { mergeMap } from "@observable/merge-map";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observableLookup = {
 *   1: pipe([1, 2, 3], ofIterable()),
 *   2: pipe([4, 5, 6], ofIterable()),
 *   3: pipe([7, 8, 9], ofIterable()),
 * } as const;
 * pipe([1, 2, 3], ofIterable(), mergeMap((value) => observableLookup[value])).subscribe({
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
    source = pipe(source, asObservable());
    return new Observable((observer) => {
      let index = 0;
      let outerSubscriptionHasReturned = false;
      let activeInnerSubscriptions = 0;

      source.subscribe({
        signal: observer.signal,
        next(value) {
          activeInnerSubscriptions++;
          pipe(project(value, index++), asObservable()).subscribe({
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
