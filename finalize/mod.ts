import { isObservable, Observable, toObservable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * The [producer](https://jsr.io/@observable/core#producer) is notifying the [consumer](https://jsr.io/@observable/core#consumer)
 * that it's done [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ing, values for any reason, and will send no more values.
 * @example
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { of } from "@observable/of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(of([1, 2, 3]), finalize(() => console.log("finalized"))).subscribe({
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
 * // "finalized"
 * // "return"
 * ```
 * @example
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
 * import { of } from "@observable/of";
 * import { flat } from "@observable/flat";
 *
 * const controller = new AbortController();
 * const source = flat([of([1, 2, 3]), throwError(new Error("error"))]);
 * pipe(source, finalize(() => console.log("finalized"))).subscribe({
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
 * // "finalized"
 * // "throw" Error: error
 * ```
 */
export function finalize<Value>(
  teardown: () => void,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof teardown !== "function") {
    throw new ParameterTypeError(0, "Function");
  }
  return function finalizeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = toObservable(source);
    return new Observable((observer) => {
      observer.signal.addEventListener("abort", () => teardown(), {
        once: true,
      });
      source.subscribe(observer);
    });
  };
}
