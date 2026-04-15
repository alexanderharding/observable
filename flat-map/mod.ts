import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";

/**
 * {@linkcode project|Projects} each {@linkcode In|value} to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) sequentially.
 * @example
 * ```ts
 * import { Subject } from "@observable/core";
 * import { flatMap } from "@observable/flat-map";
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
 * pipe(forOf(["a", "b", "c"]), flatMap((value) => observableLookup[value])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * observableLookup.b.next(1); // ignored
 * observableLookup.a.next(2);
 * observableLookup.a.next(3);
 * observableLookup.a.return();
 * observableLookup.c.next(4); // ignored
 * observableLookup.b.next(5);
 * observableLookup.b.next(6);
 * observableLookup.b.return();
 * observableLookup.c.next(7);
 * observableLookup.c.next(8);
 * observableLookup.c.return();
 *
 * // Console output:
 * // "next" 2
 * // "next" 3
 * // "next" 5
 * // "next" 6
 * // "next" 7
 * // "next" 8
 * // "return"
 * ```
 */
export function flatMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof project !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function flatMapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
    return new Observable((observer) => {
      let index = 0;
      let activeInnerSubscription = false;
      let outerSubscriptionHasReturned = false;
      const queue: Array<In> = [];

      observer.signal.addEventListener("abort", () => (queue.length = 0), {
        once: true,
      });

      source.subscribe({
        signal: observer.signal,
        next(value) {
          if (activeInnerSubscription) queue.push(value);
          else {
            activeInnerSubscription = true;
            processNextValue(value);
          }
        },
        return() {
          outerSubscriptionHasReturned = true;
          if (!activeInnerSubscription && !queue.length) observer.return();
        },
        throw: (value) => observer.throw(value),
      });

      function processNextValue(value: In): void {
        from(project(value, index++)).subscribe({
          signal: observer.signal,
          next: (value) => observer.next(value),
          return() {
            try {
              if (queue.length) return processNextValue(queue.shift()!);
              activeInnerSubscription = false;
              if (outerSubscriptionHasReturned) observer.return();
            } catch (value) {
              observer.throw(value);
            }
          },
          throw: (value) => observer.throw(value),
        });
      }
    });
  };
}
