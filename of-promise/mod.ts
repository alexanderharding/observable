import { Observable } from "@observable/core";
import {
  isPromiseLike,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";

/**
 * Projects a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { ofPromise } from "@observable/of-promise";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(Promise.resolve(42), ofPromise()).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 42
 * // "return"
 * ```
 * @example
 * ```ts
 * import { ofPromise } from "@observable/of-promise";
 * import { pipe } from "@observable/pipe";
 *
 * pipe(Promise.reject(new Error("test")), ofPromise()).subscribe({
 *   signal: new AbortController().signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "throw" Error: test
 * ```
 */
export function ofPromise<Value>(): (
  source: PromiseLike<Value>,
) => Observable<Value> {
  return function ofPromiseFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isPromiseLike(source)) throw new ParameterTypeError(0, "PromiseLike");
    return new Observable(async (observer) => {
      try {
        const value = await source;
        observer.next(value);
        observer.return();
      } catch (value) {
        observer.throw(value);
      }
    });
  };
}
