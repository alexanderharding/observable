import { isObserver, Observer } from "./observer.ts";

/**
 * Object interface that defines a standard way for a [consumer](https://jsr.io/@observable/core#consumer)
 * to [observe](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
 */
export interface Observable<Value = unknown> {
  /**
   * The act of a [consumer](https://jsr.io/@observable/core#consumer) requesting to
   * [observe](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
   */
  subscribe(observer: Observer<Value>): void;
}

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
   * // No console output
   * ```
   */
  new <Value>(
    subscribe: (observer: Observer<Value>) => void,
  ): Observable<Value>;
  readonly prototype: Observable;
}

/**
 * A fixed string that is used to identify the {@linkcode Observable} class.
 * @internal Do NOT export.
 */
const stringTag = "Observable";

export const Observable: ObservableConstructor = class<Value> {
  static {
    Object.freeze(this);
    Object.freeze(this.prototype);
  }

  readonly [Symbol.toStringTag] = stringTag;
  readonly #subscribe: (observer: Observer<Value>) => void;

  constructor(subscribe: (observer: Observer<Value>) => void) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (typeof subscribe !== "function") {
      throw new TypeError("Parameter 1 is not of type 'Function'");
    }
    Object.freeze(this);
    this.#subscribe = subscribe;
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof Observable)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObserver(observer)) throw new TypeError("Parameter 1 is not of type 'Observer'");

    // We need to ensure that we are working with an Observer instance from this library
    // so the resulting behavior is predictable.
    observer = observer instanceof Observer ? observer : new Observer(observer);

    // If the Observer has been aborted there is nothing to do.
    if (observer.signal.aborted) return;

    // From this point on, all errors are pushed to the Observer. This includes
    // errors that occur while connecting to the producer, ensuring a consistent
    // error semantics for subscribe.
    try {
      this.#subscribe(observer);
    } catch (value) {
      observer.throw(value);
    }
  }
};

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observable} interface.
 * @example
 * Instance
 * ```ts
 * import { isObservable, Observable } from "@observable/core";
 *
 * const value = new Observable((observer) => {
 *   // Implementation omitted for brevity.
 * });
 *
 * isObservable(value); // true
 * ```
 * @example
 * Object Literal
 * ```ts
 * import { isObservable, Observable } from "@observable/core";
 *
 * const value: Observable = {
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 *
 * isObservable(value); // true
 * ```
 * @example
 * Empty Object Literal
 * ```ts
 * import { isObservable } from "@observable/core";
 *
 * const value = {};
 *
 * isObservable(value); // false
 * ```
 * @example
 * Primitive
 * ```ts
 * import { isObservable } from "@observable/core";
 *
 * const value = 1;
 *
 * isObservable(value); // false
 * ```
 */
export function isObservable(value: unknown): value is Observable {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    value instanceof Observable ||
    ((typeof value === "object" && value !== null) &&
      "subscribe" in value &&
      typeof value.subscribe === "function")
  );
}
