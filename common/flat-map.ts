import { isObservable, Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";

/**
 * {@linkcode project|Projects} each [source](https://jsr.io/@xan/observable-core#source) value to an
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable), in a serialized fashion
 * waiting for each one to [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return) before
 * merging the next.
 * @example
 * ```ts
 * import { flatMap, pipe, of } from "@xan/observable-common";
 *
 * const source = of(["a", "b", "c"]);
 * const controller = new AbortController();
 * const observableLookup = {
 *   a: of([1, 2, 3]),
 *   b: of([4, 5, 6]),
 *   c: of([7, 8, 9]),
 * } as const;
 *
 * pipe(source, flatMap((value) => observableLookup[value])).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * // 7
 * // 8
 * // 9
 * // return
 * ```
 */
export function flatMap<In, Out>(
  project: (value: In, index: number) => Observable<Out>,
): (source: Observable<In>) => Observable<Out> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof project !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function flatMapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
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
          if (!activeInnerSubscription && !queue.length) {
            observer.return();
          }
        },
        throw: (value) => observer.throw(value),
      });

      function processNextValue(value: In): void {
        pipe(project(value, index++), asObservable()).subscribe({
          signal: observer.signal,
          next: (value) => observer.next(value),
          return() {
            if (queue.length) processNextValue(queue.shift()!);
            else {
              activeInnerSubscription = false;
              if (outerSubscriptionHasReturned) observer.return();
            }
          },
          throw: (value) => observer.throw(value),
        });
      }
    });
  };
}
