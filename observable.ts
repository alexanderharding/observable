import { from, isObserver, type Observer } from "@xan/observer";

/**
 * At it's highest level, an {@linkcode Observable|observable} represents a template for
 * connecting an [`Observer`](https://jsr.io/@xan/observer/doc/~/Observer), as a
 * [`consumer`](https://jsr.io/@xan/observer#consumer), to a [`producer`](https://jsr.io/@xan/observer#producer),
 * via a {@linkcode Observable.subscribe|subscribe} action.
 *
 * @example
 * Creating an observable with a synchronous producer.
 * ```ts
 * import { Observable } from '@xan/observable';
 *
 * const numbers = new Observable<number>((observer) => {
 *   // Note that this logic is invoked for every new subscribe action
 *   // unless the observer is already aborted.
 *   const producer = [1, 2, 3];
 *   for (const value of producer) {
 *     // Next the value to the Observer.
 *     observer.next(value);
 *     // If the observer has been aborted, there's no more work to do.
 *     if (observer.signal.aborted) return;
 *   }
 *   // The producer does not intend to next any more values, return.
 *   observer.return();
 * });
 *
 * // Optionally create a controller to trigger unsubscription if needed.
 * const controller = new AbortController();
 *
 * numbers.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log('return'),
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
 * import { Observable } from '@xan/observable';
 *
 * const timeout = new Observable<0>((observer) => {
 *   // Note that this logic is invoked for every new subscribe action
 *   // unless the observer is already aborted.
 *
 *   // Create a timeout to produce a value after 1 second.
 *   const producer = setTimeout(() => {
 *     // Next a successful execution code to the Observer (0).
 *     observer.next(0);
 *     // The producer does not intend to next any more values, return.
 *     observer.return();
 *   }, 1_000);
 *
 *   // Add an abort listener to handle unsubscription by canceling the producer
 *   observer.signal.addEventListener(
 *     'abort',
 *     () => clearTimeout(producer),
 *     { once: true },
 *   );
 * });
 *
 * // Optionally create a controller to trigger unsubscription if needed.
 * const controller = new AbortController();
 *
 * timeout.subscribe({
 *   signal: controller.signal,
 *   next: (value) => console.log(value),
 *   return: () => console.log('return'),
 *   throw: (error) => console.error(error),
 * });
 *
 * // console output (asynchronously):
 * // 0
 * // return
 * ```
 */
export interface Observable<Value = unknown> {
  /**
   * The act of a [`consumer`](https://jsr.io/@xan/observer#consumer) requesting from an
   * {@linkcode Observable|observable} to set up a [`subscription`](https://jsr.io/@xan/observer#subscription)
   * so that it may [`observe`](https://jsr.io/@xan/observer#observation) a [`producer`](https://jsr.io/@xan/observer#producer).
   */
  subscribe(observer: Observer<Value>): void;
}

// The main reason this JSDoc exists, is to satisfy the JSR score. In reality,
// the JSDoc on the above type is enough for the DX on both symbols.
/**
 * @class
 */
export const Observable: ObservableConstructor = class {
  readonly [Symbol.toStringTag] = "Observable"; // Use a string literal so it does not get minified.
  readonly #subscribe: (observer: Observer) => void;

  constructor(subscribe: (observer: Observer) => void) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (typeof subscribe !== "function") {
      throw new TypeError("Parameter 1 is not of type 'Function'");
    }
    Object.freeze(this);
    this.#subscribe = subscribe;
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof Observable)) {
      throw new TypeError("'this' is not instanceof 'Observable'");
    }
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObserver(observer)) {
      throw new TypeError("Parameter 1 is not of type 'Observer'");
    }
    observer = from(observer);
    try {
      if (!observer.signal.aborted) this.#subscribe(observer);
    } catch (value) {
      observer.throw(value);
    }
  }
};

Object.freeze(Observable);
Object.freeze(Observable.prototype);

/**
 * Object interface for an {@linkcode Observable} factory.
 *
 * @internal Do NOT export.
 */
interface ObservableConstructor {
  /**
   * Creates a template for connecting a [`producer`](https://jsr.io/@xan/observer#producer) to a [`consumer`](https://jsr.io/@xan/observer#consumer) via a {@linkcode Observable.subscribe|subscribe} action.
   * @param subscribe The function called for each {@linkcode Observable.subscribe|subscribe} action.
   * @example
   * Creating an observable with a synchronous producer.
   * ```ts
   * import { Observable } from '@xan/observable';
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
   *   return: () => console.log('return'),
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
   * import { Observable } from '@xan/observable';
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
   *     'abort',
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
   *   return: () => console.log('return'),
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
   * import { Observable } from '@xan/observable';
   *
   * const observable = new Observable<never>();
   *
   * // Create a controller to trigger unsubscription if needed.
   * const controller = new AbortController();
   *
   * observable.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log('return'),
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
