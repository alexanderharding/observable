import { isObservable, Observable, type Observer } from "@observable/core";
import { from } from "@observable/from";

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
 * [`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all [notifications](https://jsr.io/@observable/core#notification) as values.
 * @example
 * Notifications as values
 * ```ts
 * import { materialize } from "@observable/materialize";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(forOf([1, 2, 3]), materialize()).subscribe({
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
 * Throw notification
 * ```ts
 * import { materialize } from "@observable/materialize";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
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
 * import { forOf } from "@observable/for-of";
 * import { Observer } from "@observable/core";
 *
 * describe("example", () => {
 *  let controller: AbortController;
 *
 *  beforeEach(() => (controller = new AbortController()));
 *
 *  afterEach(() => controller?.abort());
 *
 *  it("should emit the notifications", () => {
 *    // Arrange
 *    const notifications: Array<ObserverNotification<number>> = [];
 *
 *    // Act
 *    pipe(forOf([1, 2, 3]), materialize()).subscribe(
 *      new Observer({
 *        signal: controller.signal,
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
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    source = from(source);
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
