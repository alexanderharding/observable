import { isObserver, Observer } from "./observer.ts";
import { isObservable, Observable } from "./observable.ts";

/**
 * Object type that is an {@linkcode Observer} and an {@linkcode Observable}.
 */
export type Subject<Value = unknown> = Observer<Value> & Observable<Value>;

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

/**
 * Flag indicating that a value is not thrown.
 * @internal Do NOT export.
 */
const notThrown = Symbol("Flag indicating that a value is not thrown.");

/**
 * A fixed string that is used to identify the {@linkcode Subject} class.
 * @internal Do NOT export.
 */
const stringTag = "Subject";

export const Subject: SubjectConstructor = class<Value> {
  static {
    Object.freeze(this);
    Object.freeze(this.prototype);
  }

  readonly [Symbol.toStringTag] = stringTag;
  /**
   * Tracking the value that was thrown by the [producer](https://jsr.io/@observable/core#producer), if any.
   */
  #thrown: unknown = notThrown;

  /**
   * Tracking a known list of unique {@linkcode Observer|observers}, so we don't have to clone them while
   * iterating to prevent reentrant behaviors.
   */
  #observersSnapshot?: ReadonlySet<Observer<Value>>;
  readonly #observers = new Set<Observer<Value>>();

  readonly #observer = new Observer<Value>({
    next: (value) => {
      // Multicast this notification.
      (this.#observersSnapshot ??= new Set(this.#observers)).forEach(
        (observer) => observer.next(value),
      );
    },
    return: () => {
      // Multicast this notification.
      (this.#observersSnapshot ??= new Set(this.#observers)).forEach(
        (observer) => observer.return(),
      );
    },
    throw: (value) => {
      // Set the finalization state before multicasting in-case of reentrant code.
      this.#thrown = value;

      // Rethrow if there are no observers so it can be reported as unhandled.
      if (this.#observers.size === 0) throw value;

      // Multicast this notification.
      (this.#observersSnapshot ??= new Set(this.#observers)).forEach(
        (observer) => observer.throw(value),
      );
    },
  });
  readonly signal = this.#observer.signal;

  readonly #observable = new Observable((observer) => {
    // Check if this subject has finalized so we can notify the observer immediately.
    if (this.#thrown !== notThrown) observer.throw(this.#thrown);
    else if (this.signal.aborted) observer.return();

    // If the observer is already aborted or already tracked there's nothing to do.
    if (observer.signal.aborted || this.#observers.has(observer)) return;

    // Keep track of this observer so it can begin to receive push notifications from this subject.
    this.#observers.add(observer);

    // Reset the observers snapshot since it's now stale due to this observer being tracked.
    this.#observersSnapshot = undefined;

    // Untrack this observer when it's at the end of its lifecycle.
    observer.signal.addEventListener(
      "abort",
      () => {
        // Untrack this observer since it can no longer receive push notifications.
        this.#observers.delete(observer);
        // Reset the observers snapshot since it's now stale due to this observer being untracked.
        this.#observersSnapshot = undefined;
      },
      { once: true },
    );
  });

  constructor() {
    Object.freeze(this);
  }

  next(value: Value): void {
    if (!(this instanceof Subject)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    // No arguments.length check because Value may be void, making next() with no args valid.

    this.#observer.next(value);
  }

  return(): void {
    if (this instanceof Subject) this.#observer.return();
    else throw new TypeError(`'this' is not instanceof '${stringTag}'`);
  }

  throw(value: unknown): void {
    if (!(this instanceof Subject)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    this.#observer.throw(value);
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof Subject)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObserver(observer)) throw new TypeError("Parameter 1 is not of type 'Observer'");
    this.#observable.subscribe(observer);
  }
};

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Subject} interface.
 * @example
 * Instance
 * ```ts
 * import { isSubject, Subject } from "@observable/core";
 *
 * const value = new Subject();
 *
 * isSubject(value); // true
 * ```
 * @example
 * Literal
 * ```ts
 * import { isSubject, Subject } from "@observable/core";
 *
 * const value: Subject = {
 *   signal: {
 *     aborted: false,
 *     onabort: null,
 *     throwIfAborted() {
 *       // Implementation omitted for brevity.
 *     },
 *     addEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     removeEventListener() {
 *       // Implementation omitted for brevity.
 *     },
 *     dispatchEvent() {
 *       // Implementation omitted for brevity.
 *     },
 *   },
 *   next(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   return() {
 *     // Implementation omitted for brevity.
 *   },
 *   throw(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 *
 * isSubject(value); // true
 * ```
 * @example
 * Empty Object
 * ```ts
 * import { isSubject } from "@observable/core";
 *
 * const value = {};
 * isSubject(value); // false
 * ```
 * @example
 * Primitive
 * ```ts
 * import { isSubject } from "@observable/core";
 *
 * const value = 1;
 *
 * isSubject(value); // false
 * ```
 */
export function isSubject(value: unknown): value is Subject {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return value instanceof Subject || (isObservable(value) && isObserver(value));
}
