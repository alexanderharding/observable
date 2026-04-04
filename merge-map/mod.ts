import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * {@linkcode project|Projects} each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
 * value to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { mergeMap } from "@observable/merge-map";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observableLookup = {
 *   1: forOf([1, 2, 3]),
 *   2: forOf([4, 5, 6]),
 *   3: forOf([7, 8, 9]),
 * } as const;
 * pipe(forOf([1, 2, 3]), mergeMap((value) => observableLookup[value])).subscribe({
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
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function mergeMapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return new Observable((observer) => {
      let index = 0;
      let outerSubscriptionHasReturned = false;
      let activeInnerSubscriptions = 0;

      source.subscribe({
        signal: observer.signal,
        next(value) {
          activeInnerSubscriptions++;
          from(project(value, index++)).subscribe({
            signal: observer.signal,
            next: (value) => observer.next(value),
            return() {
              if (!--activeInnerSubscriptions && outerSubscriptionHasReturned) observer.return();
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
