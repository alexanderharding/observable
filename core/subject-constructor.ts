import type { Subject } from "./subject.ts";

/**
 * Object interface for a {@linkcode Subject} factory.
 */
export interface SubjectConstructor {
  /**
   * Creates and returns an object that acts as both an [`observer`](https://jsr.io/@observable/core/doc/~/Observer)
   * ([`multicast`](https://jsr.io/@observable/core#multicast)) and an [`observable`](https://jsr.io/@observable/core/doc/~/Observable)
   * ([`hot`](https://jsr.io/@observable/core#hot)). [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)
   * and [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) will be replayed to late
   * [`consumers`](https://jsr.io/@observable/core#consumer) upon [`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
   * @example
   * Basic
   * ```ts
   * import { Subject } from "@observable/core";
   *
   * const subject = new Subject<number>();
   * const controller = new AbortController();
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: () => console.error("throw"),
   * });
   *
   * subject.next(1);
   *
   * // Console output:
   * // 1
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: () => console.error("throw"),
   * });
   *
   * subject.next(2);
   *
   * // Console output:
   * // 2
   * // 2
   *
   * subject.return();
   *
   * // Console output:
   * // return
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: () => console.error("throw"),
   * });
   *
   * // Console output:
   * // return
   * ```
   * @example
   * Advanced
   * ```ts
   * import { Subject, toObservable } from "@observable/core";
   *
   * class Authenticator {
   *   readonly #events = new Subject<Event>();
   *   // Hide the Observer from the public API by exposing the Subject as an Observable.
   *   readonly events = toObservable(this.#events);
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
