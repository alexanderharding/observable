import type { Observable } from "./observable.ts";
import type { Observer } from "./observer.ts";

/**
 * Object interface for an {@linkcode Observable} factory.
 */
export interface ObservableConstructor {
  /**
   * Creates and returns an object that acts as a template for connecting a [producer](https://jsr.io/@observable/core#producer)
   * to a [consumer](https://jsr.io/@observable/core#consumer) via a {@linkcode Observable.subscribe|subscribe} action.
   * @param subscribe The function called for each {@linkcode Observable.subscribe|subscribe} action.
   * @example
   * Creating an observable with a synchronous producer.
   * ```ts
   * import { Observable } from "@observable/core";
   *
   * const observable = new Observable<number>((observer) => {
   *   // Create an Array as our producer to next a sequence of values.
   *   const producer = [1, 2, 3];
   *   for (const value of producer) {
   *     // A value has been produced, notify next.
   *     observer.next(value);
   *     // If the observer has been aborted, there's no more work to do.
   *     if (observer.signal.aborted) return;
   *   }
   *   // The producer is done, notify return.
   *   observer.return();
   * });
   *
   * // Optionally create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.error("throw", value),
   * });
   *
   * // Console output (synchronously):
   * // "next" 1
   * // "next" 2
   * // "next" 3
   * // "return"
   * ```
   *
   * @example
   * Creating an observable with an asynchronous producer.
   * ```ts
   * import { Observable } from "@observable/core";
   *
   * const observable = new Observable<0>((observer) => {
   *   // Create a timeout as our producer to next a successful execution code (0) after 1 second.
   *   const producer = setTimeout(() => {
   *     // A value has been produced, notify next.
   *     observer.next(0);
   *     // The producer is done, notify return.
   *     observer.return();
   *   }, 1000);
   *
   *   // Add an abort listener to handle unsubscription by canceling the producer.
   *   observer.signal.addEventListener(
   *     "abort",
   *     () => clearTimeout(producer),
   *     { once: true },
   *   );
   * });
   *
   * // Create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.error("throw", value),
   * });
   *
   * // Console output (asynchronously):
   * // "next" 0
   * // "return"
   * ```
   *
   * @example
   * Creating an observable with no producer.
   * ```ts
   * import { Observable } from "@observable/core";
   *
   * const observable = new Observable<never>();
   *
   * // Create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.error("throw", value),
   * });
   *
   * // no console output
   * ```
   */
  new <Value>(
    subscribe: (observer: Observer<Value>) => void,
  ): Observable<Value>;
  readonly prototype: Observable;
}
