import type { Observable } from "@observable/core";
import { forOf } from "@observable/for-of";

/**
 * [Pushes](https://jsr.io/@observable/core#push) the given {@linkcode value}.
 * @example
 * ```ts
 * import { of } from "@observable/of";
 *
 * const controller = new AbortController();
 *
 * of(1).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" 1
 * // "return"
 * ```
 */
export function of<const Value>(value: Value): Observable<Value> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return forOf([value]);
}
