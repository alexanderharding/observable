import { Observable } from "@observable/core";

/**
 * [`Throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s the given {@linkcode value} immediately upon
 * [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
 * @example
 * ```ts
 * import { throwError } from "@observable/throw-error";
 *
 * const controller = new AbortController();
 *
 * throwError(new Error("throw")).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log("next", value), // Never called
 *   return: () => console.log("return"), // Never called
 *   throw: (value) => console.log("throw", value), // Called immediately
 * });
 * ```
 */
export function throwError(value: unknown): Observable<never> {
  return new Observable((observer) => observer.throw(value));
}
