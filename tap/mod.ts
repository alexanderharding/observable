import { isObservable, type Observable } from "@observable/core";
import { pipe } from "@observable/pipe";
import { map } from "@observable/map";

/**
 * Registers the given {@linkcode callback} to be invoked for each {@linkcode Value|value}.
 * @example
 * ```ts
 * import { tap } from "@observable/tap";
 * import { forOf } from "@observable/for-of";
 * import { pipe } from "@observable/pipe";
 *
 * const controller = new AbortController();
 *
 * pipe(
 *   forOf([1, 2, 3]),
 *   tap((value) => console.log("tap callback", value)),
 * ).subscribe({
 *   signal: controller.signal,
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
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof callback !== "function") throw new TypeError("Parameter 1 is not of type 'Function'");
  return function tapFn(source) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObservable(source)) throw new TypeError("Parameter 1 is not of type 'Observable'");
    return pipe(
      source,
      map((value, index) => {
        callback(value, index);
        return value;
      }),
    );
  };
}
