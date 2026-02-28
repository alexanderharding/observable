import { isObservable, type Observable, Observer } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { AsyncSubject } from "@observable/async-subject";
import { pipe } from "@observable/pipe";
import { share } from "@observable/share";

/**
 * Projects the provided {@linkcode observable|Observable} to a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 * that either resolves with the last [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value on
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return), rejects with a
 * [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n value, or rejects with a
 * [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
 * if the  the provided {@linkcode observable|Observable} [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s
 * without [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.
 * @example
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * console.log(await lastValueFrom(pipe([1, 2, 3], ofIterable())));
 *
 * // Console output:
 * // 3
 * ```
 * @example
 * ```ts
 * import { lastValueFrom } from "@observable/last-value-from";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 * import { take } from "@observable/take";
 *
 * console.log(await lastValueFrom(pipe([1, 2, 3], ofIterable(), take(1))));
 *
 * // Console output:
 * // 1
 * ```
 * @example
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
export function lastValueFrom<Value>(observable: Observable<Value>): Promise<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isObservable(observable)) throw new ParameterTypeError(0, "Observable");
  return new Promise((resolve, reject) => {
    pipe(observable, share(() => new AsyncSubject())).subscribe(
      new Observer({
        next: (value) => resolve(value),
        // Reject on return to avoid hanging promises if the source is empty.
        return: () => reject(new TypeError("Cannot convert empty Observable to Promise")),
        throw: (value) => reject(value),
      }),
    );
  });
}
