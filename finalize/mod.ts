import { isObservable, Observable } from "@observable/core";
import { from } from "@observable/from";
import { ParameterTypeError } from "@observable/internal";

/**
 * The [consumer](https://jsr.io/@observable/core#consumer) is telling the [producer](https://jsr.io/@observable/core#producer)
 * it's no longer interested in receiving {@linkcode Value|values}.
 * @example
 * Return
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 * pipe(forOf([1, 2, 3]), finalize(() => console.log("finalized"))).subscribe({
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
 * Throw
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { throwError } from "@observable/throw-error";
 * import { pipe } from "@observable/pipe";
 * import { forOf } from "@observable/for-of";
 * import { flat } from "@observable/flat";
 *
 * const controller = new AbortController();
 * const source = flat([forOf([1, 2, 3]), throwError(new Error("error"))]);
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
 * @example
 * Unsubscribe
 * ```ts
 * import { finalize } from "@observable/finalize";
 * import { pipe } from "@observable/pipe";
 * import { never } from "@observable/never";
 *
 * const controller = new AbortController();
 * pipe(never, finalize(() => console.log("finalized"))).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * controller.abort();
 *
 * // Console output:
 * // "finalized"
 * ```
 */
export function finalize<Value>(
  callback: () => void,
): (source: Observable<Value>) => Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof callback !== "function") throw new ParameterTypeError(0, "Function");
  return function finalizeFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    source = from(source);
    return new Observable((observer) => {
      observer.signal.addEventListener("abort", () => callback(), { once: true });
      source.subscribe(observer);
    });
  };
}
