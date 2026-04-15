import { Observable } from "@observable/core";

/**
 * [Pushes](https://jsr.io/@observable/core#push) each key of the given {@linkcode object} in order.
 * @example
 * ```ts
 * import { forIn } from "@observable/for-in";
 *
 * const controller = new AbortController();
 * const object = { a: 1, b: 2, c: 3 } as const;
 *
 * forIn(object).subscribe({
 *   signal: controller.signal,
 *   next: (key) => console.log("next", key, object[key]),
 *   return: () => console.log("return"),
 *   throw: (value) => console.error("throw", value),
 * });
 *
 * // Console output:
 * // "next" "a" 1
 * // "next" "b" 2
 * // "next" "c" 3
 * // "return"
 * ```
 */
export function forIn(object: object): Observable<string> {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  if (typeof object !== "object" || object === null) {
    throw new TypeError("Parameter 1 is not of type 'Object'");
  }
  return new Observable((observer) => {
    for (const key in object) {
      observer.next(key);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
}
