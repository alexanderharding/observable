import { isObservable, type Observable } from "@observable/core";
import { pipe } from "@observable/pipe";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";
import { map } from "@observable/map";

/**
 * Performs a {@linkcode callback|side-effect} for each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value
 * from the [source](https://jsr.io/@observable/core#source) [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).
 * @example
 * ```ts
 * import { tap } from "@observable/tap";
 * import { ofIterable } from "@observable/of-iterable";
 * import { pipe } from "@observable/pipe";
 *
 * const activeSubscriptionController = new AbortController();
 *
 * pipe(
 *   [1, 2, 3],
 *   ofIterable(),
 *   tap((value) => console.log("tap callback", value)),
 * ).subscribe({
 *   signal: activeSubscriptionController.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.log("throw", value),
 * });
 *
 * // Console output:
 * // "tap callback" 1
 * // "next" 1
 * // "tap callback" 2
 * // "next" 2
 * // "tap callback" 3
 * // "next" 3
 * // "return"
 * ```
 */
export function tap<Value>(
  callback: (value: Value, index: number) => void,
): (source: Observable<Value>) => Observable<Value> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof callback !== "function") throw new ParameterTypeError(0, "Function");
  return function tapFn(source) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObservable(source)) throw new ParameterTypeError(0, "Observable");
    return pipe(
      source,
      map((value, index) => {
        callback(value, index);
        return value;
      }),
    );
  };
}
