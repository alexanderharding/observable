import { isObservable, Observable } from "@observable/core";
import { asObservable } from "@observable/as-observable";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * {@linkcode project|Projects} each [source](https://jsr.io/@observable/core#source) value to an
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
 * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable), in a serialized fashion
 * waiting for each one to [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) before
 * merging the next.
 * @example
 * ```ts
 * import { flatMap } from "@observable/flat-map";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const source = pipe(["a", "b", "c"], ofIterable());
 * const controller = new AbortController();
 * const observableLookup = {
 *   a: pipe([1, 2, 3], ofIterable()),
 *   b: pipe([4, 5, 6], ofIterable()),
 *   c: pipe([7, 8, 9], ofIterable()),
 * } as const;
 *
 * pipe(source, flatMap((value) => observableLookup[value])).subscribe({
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
