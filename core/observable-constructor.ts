import type { Observable } from "./observable.ts";
import type { Observer } from "./observer.ts";

/**
 * Object interface for an {@linkcode Observable} factory.
 */
export interface ObservableConstructor {
  /**
   * Creates and returns an object that acts as a template for connecting a [producer](https://jsr.io/@xan/observable-core#producer)
   * to a [consumer](https://jsr.io/@xan/observable-core#consumer) via a {@linkcode Observable.subscribe|subscribe} action.
   * @param subscribe The function called for each {@linkcode Observable.subscribe|subscribe} action.
   * @example
   * Creating an observable with a synchronous producer.
   * ```ts
   * import { Observable } from "@xan/observable-core";
   *
   * const observable = new Observable<number>((observer) => {
   *   // Note that this logic is invoked for every new subscribe action.
   *   const producer = [1, 2, 3];
   *   for (const value of producer) {
   *     // If the observer has been aborted, there's no more work to do.
   *     if (observer.signal.aborted) return;
   *     // Next the value to the observer
   *     observer.next(value);
   *   }
   *   // The producer is done, return.
   *   observer.return();
   * });
   *
   * // Optionally create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (error) => console.error(error),
   * });
   *
   * // console output (synchronously):
   * // 1
   * // 2
   * // 3
   * // return
   * ```
   *
   * @example
   * Creating an observable with an asynchronous producer.
   * ```ts
   * import { Observable } from "@xan/observable-core";
   *
   * const observable = new Observable<0>((observer) => {
   *   // Note that this logic is invoked for every new subscribe action.
   *
   *   // If the observer is already aborted, there's no work to do.
   *   if (observer.signal.aborted) return;
   *
   *   // Create a timeout as our producer to next a value after 1 second.
   *   const producer = setTimeout(() => {
   *     // Next the value to the observer
   *     observer.next(0);
   *     // The producer is done, return.
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
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (error) => console.error(error),
   * });
   *
   * // console output (asynchronously):
   * // 0
   * // return
   * ```
   *
   * @example
   * Creating an observable with no producer.
   * ```ts
   * import { Observable } from "@xan/observable-core";
   *
   * const observable = new Observable<never>();
   *
   * // Create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (error) => console.error(error),
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
