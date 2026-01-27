import { isObservable, Observable, type Observer, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Represents any type of [`Observer`](https://jsr.io/@observable/core/doc/~/Observer)
 * [notification](https://jsr.io/@observable/core#notification).
 */
export type ObserverNotification<Value = unknown> = Readonly<
  | [type: Extract<"next", keyof Observer>, value: Value]
  | [type: Extract<"return", keyof Observer>]
  | [type: Extract<"throw", keyof Observer>, value: unknown]
>;

/**
 * Projects all of the [`Observer`](https://jsr.io/@observable/core/doc/~/Observer) [notification](https://jsr.io/@observable/core#notification)
 * as [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values.
 * @example
 * ```ts
 * import { materialize } from "@observable/materialize";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
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
 * import { materialize } from "@observable/materialize";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
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
 * import { materialize, ObserverNotification } from "@observable/materialize";
 * import { pipe } from "@observable/pipe";
 * import { of } from "@observable/of";
 * import { Observer } from "@observable/core";
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
    source = toObservable(source);
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
