import { Observable } from "@xan/observable-core";

/**
 * Creates an [`Observable`](https://jsr.io/@xan/observable-core/doc/~/Observable) that will [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw) the
 * given `value` immediately upon [`subscribe`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
 *
 * @param value The value to [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw).
 * @example
 * ```ts
 * import { throwError } from "@xan/observable-common";
 *
 * const controller = new AbortController();
 *
 * throwError(new Error("throw")).subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value), // Never called
 *   return: () => console.log("return"), // Never called
 *   throw: (value) => console.log(value), // Called immediately
 * });
 * ```
 */
export function throwError(value: unknown): Observable<never> {
  return new Observable((observer) => observer.throw(value));
}
