import { isObservable, Observable } from "@xan/observable-core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@xan/observable-internal";
import type { ObserverNotification } from "./observer-notification.ts";
import { pipe } from "./pipe.ts";
import { asObservable } from "./as-observable.ts";

/**
 * Represents all of the {@linkcode ObserverNotification|notifications} from the
 * [source](https://jsr.io/@xan/observable-core#source) as
 * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values
 * marked with their original types within {@linkcode ObserverNotification|notification} entries.
 * This is especially useful for testing, debugging, and logging.
 * @example
 * ```ts
 * import { materialize, of, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3]), materialize()).subscribe({
 *  signal: controller.signal,
 *  next: (value) => console.log(value),
 *  return: () => console.log("return"),
 *  throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // ["next", 1]
 * // ["next", 2]
 * // ["next", 3]
 * // ["return"]
 * // "return"
 * ```
 * @example
 * ```ts
 * import { throwError, of, materialize, pipe } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 * pipe(throwError(new Error("error")), materialize()).subscribe({
 *  signal: controller.signal,
 *  next: (value) => console.log("next", value),
 *  return: () => console.log("return"),
 *  throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // ["throw", new Error("error")]
 * // "return"
 * ```
 * @example
 * Unit testing
 * ```ts
 * import { materialize, pipe, of } from "@xan/observable-common";
 *
 * const observable = of([1, 2, 3]);
 *
 * describe("observable", () => {
 *  let activeSubscriptionController: AbortController;
 *
 *  beforeEach(() => activeSubscriptionController = new AbortController());
 *
 *  afterEach(() => activeSubscriptionController?.abort());
 *
 *  it("should emit the notifications", () => {
 *    // Arrange
 *    const notifications: Array<ObserverNotification<number>> = [];
 *
 *    // Act
 *    pipe(observable, materialize()).subscribe(
 *      new Observer({
 *        signal: activeSubscriptionController.signal,
 *        next: (notification) => notifications.push(notification),
 *      }),
 *    );
 *
 *    // Assert
 *    expect(notifications).toEqual([
 *      ["next", 1],
 *      ["next", 2],
 *      ["next", 3],
 *      ["return"],
 *    ]);
 *  });
 * });
 * ```
 */
export function materialize<Value>(): (
  source: Observable<Value>,
) => Observable<ObserverNotification<Value>> {
  return function materializeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = pipe(source, asObservable());
    return new Observable((observer) =>
      source.subscribe({
        signal: observer.signal,
        next: (value) => observer.next(["next", value]),
        return() {
          observer.next(["return"]);
          observer.return();
        },
        throw(value) {
          observer.next(["throw", value]);
          observer.return();
        },
      })
    );
  };
}
