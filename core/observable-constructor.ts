import type { Observable } from "./observable.ts";
import type { Observer } from "./observer.ts";

/**
 * Object interface for an {@linkcode Observable} factory.
 */
export interface ObservableConstructor {
  /**
   * Creates and returns an object that acts as a template for a [consumer](https://jsr.io/@observable/core#consumer)
   * to [observe](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
   * @example
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
   * // Create a controller to abort the observation if needed.
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
   * @example
   * ```ts
   * import { Observable } from "@observable/core";
   *
   * const observable = new Observable<void>((observer) => {
   *   // Create a timeout as our producer to next after 1 second.
   *   const producer = setTimeout(() => {
   *     // A value has been produced, notify next.
   *     observer.next();
   *     // The producer is done, notify return.
   *     observer.return();
   *   }, 1_000);
   *
   *   // Add an abort listener to cancel the producer.
   *   observer.signal.addEventListener(
   *     "abort",
   *     () => clearTimeout(producer),
   *     { once: true },
   *   );
   * });
   *
   * // Create a controller to abort the observation if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.error("throw", value),
   * });
   *
   * // Console output (after 1 second):
   * // "next" undefined
   * // "return"
   * ```
   * @example
   * ```ts
   * import { Observable } from "@observable/core";
   *
   * const observable = new Observable<never>(() => {
   *   // This Observable intentionally never calls next, return, or throw.
   *   // It represents an infinite stream with no values.
   * });
   *
   * // Create a controller to abort the observation if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.error("throw", value),
   * });
   *
   * // No console output
   * ```
   */
  new <Value>(
    subscribe: (observer: Observer<Value>) => void,
  ): Observable<Value>;
  readonly prototype: Observable;
}
