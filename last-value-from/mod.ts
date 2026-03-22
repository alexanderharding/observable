import { isObservable, type Observable, Observer } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { pipe } from "@observable/pipe";
import { at } from "@observable/at";

/**
 * Projects the {@linkcode observable} to a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 * that either resolves with the last [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value on
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return), rejects with a
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n value, or rejects with a
 * [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
 * if the {@linkcode observable} [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s
 * without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.
 * @example
 * Last emitted value
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { forOf } from "@observable/for-of";
 *
 * console.log(await lastValueFrom(forOf([1, 2, 3])));
 *
 * // Console output:
 * // 3
 * ```
 * @example
 * Inner PromiseLike
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { of } from "@observable/of";
 *
 * console.log(await lastValueFrom(of(Promise.resolve(3))));
 *
 * // Console output:
 * // 3
 * ```
 * @example
 * take(1) count
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 * import { take } from "@observable/take";
 *
 * console.log(await lastValueFrom(pipe(forOf([1, 2, 3]), take(1))));
 *
 * // Console output:
 * // 1
 * ```
 * @example
 * Source throws
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { throwError } from "@observable/throw-error";
 *
 * try {
 *   await lastValueFrom(throwError(new Error("test")));
 * } catch (error) {
 *   console.log(error);
 * }
 *
 * // Console output:
 * // Error: test
 * ```
 * @example
 * Empty observable
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { empty } from "@observable/empty";
 *
 * try {
 *   await lastValueFrom(empty);
 * } catch (error) {
 *   console.log(error);
 * }
 *
 * // Console output:
 * // TypeError: Cannot convert empty Observable to Promise
 * ```
 */
export function lastValueFrom<Value>(
  observable: Observable<Value | PromiseLike<Value>>,
): Promise<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(observable)) throw new ParameterTypeError(0, "Observable");
  return new Promise((resolve, reject) => {
    pipe(observable, at(-1)).subscribe(
      new Observer({
        next: (value) => resolve(value),
        // Reject on return to avoid hanging promises if the source is empty.
        return: () => reject(new TypeError("Cannot convert empty Observable to Promise")),
        throw: (value) => reject(value),
      }),
    );
  });
}
