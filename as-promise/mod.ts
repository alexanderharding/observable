import { isObservable, type Observable, Observer } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { AsyncSubject } from "@observable/async-subject";
import { pipe } from "@observable/pipe";
import { share } from "@observable/share";

/**
 * Projects an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) through a
 * [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
 * Since [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)s
 * have no concept of [`return`](https://jsr.io/@observable/core/doc/~/Observer.return),
 * this operator will reject with a [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError)
 * if the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
 * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s without
 * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing a value.
 * @example
 * ```ts
 * import { asPromise } from "@observable/as-promise";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 *  console.log(await pipe(of([1, 2, 3]), asPromise()));
 *
 * // Console output:
 * // 3
 * ```
 * @example
 * ```ts
 * import { asPromise } from "@observable/as-promise";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
 *
 * try {
 *   console.log(await pipe(throwError(new Error("test")), asPromise()));
 * } catch (error) {
 *   console.log(error);
 *   // Console output:
 *   // Error: test
 * }
 * ```
 * @example
 * ```ts
 * import { asPromise } from "@observable/as-promise";
 * import { empty } from "@observable/empty";
 * import { pipe } from "@observable/pipe";
 *
 * try {
 *   console.log(await pipe(empty, asPromise()));
 * } catch (error) {
 *   console.log(error);
 *   // Console output:
 *   // TypeError: Cannot convert empty Observable to Promise
 * }
 * ```
 * @example
 * ```ts
 * import { asPromise } from "@observable/as-promise";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * try {
 *   console.log(await pipe(of([]), asPromise()));
 * } catch (error) {
 *   console.log(error);
 *   // Console output:
 *   // TypeError: Cannot convert empty Observable to Promise
 * }
 * ```
 */
export function asPromise<Value>(): (
  source: Observable<Value>,
) => Promise<Value> {
  return function asPromiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    const { resolve, reject, promise } = Promise.withResolvers<Value>();
    pipe(source, share(() => new AsyncSubject())).subscribe(
      new Observer<Value>({
        next: resolve,
        // Reject on return to avoid hanging promises if the source is empty.
        return: () => reject(new TypeError("Cannot convert empty Observable to Promise")),
        throw: reject,
      }),
    );
    return promise;
  };
}
