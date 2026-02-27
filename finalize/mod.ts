import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * The [consumer](https://jsr.io/@observable/core#consumer) is telling the [producer](https://jsr.io/@observable/core#producer)
 * it's no longer interested in receiving {@linkcode Value|values}.
 * @example
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe([1, 2, 3], ofIterable(), finalize(() => console.log("finalized"))).subscribe({
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
 * import { ofIterable } from "@observable/of-iterable";
 * import { flat } from "@observable/flat";
 *
 * const controller = new AbortController();
 * const source = flat([pipe([1, 2, 3], ofIterable()), throwError(new Error("error"))]);
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
  if (typeof teardown !== "function") throw new ParameterTypeError(0, "Function");
  return function finalizeFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return new Observable((observer) => {
      observer.signal.addEventListener("abort", () => teardown(), {
        once: true,
      });
      source.subscribe(observer);
    });
  };
}
