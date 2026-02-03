import type { Subject } from "./subject.ts";

/**
 * Object interface for a {@linkcode Subject} factory.
 */
export interface SubjectConstructor {
  /**
   * Creates and returns an object that acts as a [multicast](https://jsr.io/@observable/core#multicast)
   * [`Observer`](https://jsr.io/@observable/core/doc/~/Observer) and a [hot](https://jsr.io/@observable/core#hot)
   * [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) replaying
   * [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) and [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)
   * to late [consumers](https://jsr.io/@observable/core#consumer) upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { Subject } from "@observable/core";
   *
   * const subject = new Subject<number>();
   * const controller = new AbortController();
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * subject.next(1);
   *
   * // Console output:
   * // "next" 1
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * subject.next(2);
   *
   * // Console output:
   * // "next" 2
   * // "next" 2
   *
   * subject.return();
   *
   * // Console output:
   * // "return"
   * // "return"
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // "return"
   * ```
   * @example
   * ```ts
   * import { Subject, Observable } from "@observable/core";
   *
   * class Authenticator {
   *   readonly #events = new Subject<Event>();
   *   // Hide the Observer from the public API by exposing the Subject as an Observable.
   *   readonly events = new Observable((observer) => this.#events.subscribe(observer));
   *
   *   [Symbol.dispose]() {
   *     this.#events.return(); // Cleanup resources.
   *   }
   *
   *   login() {
   *     // Execute some login logic...
   *     this.#events.next(new Event("login"));
   *   }
   *
   *   logout() {
   *     // Execute some logout logic...
   *     this.#events.next(new Event("logout"));
   *   }
   * }
   * ```
   */
  new (): Subject;
  new <Value>(): Subject<Value>;
  readonly prototype: Subject;
}
