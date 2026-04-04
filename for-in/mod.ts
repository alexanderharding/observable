import { Observable } from "@observable/core";
import { MinimumArgumentsRequiredError, ParameterTypeError } from "@observable/internal";

/**
 * Projects an [`Object`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)'s keys
 * to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s
 * each key in order upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
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
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  if (typeof object !== "object" || object === null) throw new ParameterTypeError(0, "Object");
  return new Observable((observer) => {
    for (const key in object) {
      observer.next(key);
      if (observer.signal.aborted) return;
    }
    observer.return();
  });
}
