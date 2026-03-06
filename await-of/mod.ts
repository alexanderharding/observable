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
 * import { awaitOf } from "@observable/await-of";
 *
 * awaitOf(Promise.resolve(42)).subscribe({
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
 * import { awaitOf } from "@observable/await-of";
 *
 * awaitOf(Promise.reject(new Error("test"))).subscribe({
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
export function awaitOf<Value>(promise: PromiseLike<Value>): Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (!isPromiseLike(promise)) throw new ParameterTypeError(0, "PromiseLike");
  return new Observable(async (observer) => {
    try {
      observer.next(await promise);
      observer.return();
    } catch (value) {
      observer.throw(value);
    }
  });
}
