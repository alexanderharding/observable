import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) concurrently.
 * @example
 * ```ts
 * import { Subject } from "@observable/core";
 * import { mergeMap } from "@observable/merge-map";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * const observableLookup = {
 *   a: new Subject<number>(),
 *   b: new Subject<number>(),
 *   c: new Subject<number>(),
 * } as const;
 *
 * pipe(forOf(["a", "b", "c"]), mergeMap((value) => observableLookup[value])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * observableLookup.b.next(1);
 * observableLookup.a.next(2);
 * observableLookup.a.next(3);
 * observableLookup.a.return();
 * observableLookup.c.next(4);
 * observableLookup.b.next(5);
 * observableLookup.b.next(6);
 * observableLookup.b.return();
 * observableLookup.c.next(7);
 * observableLookup.c.next(8);
 * observableLookup.c.return();
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
