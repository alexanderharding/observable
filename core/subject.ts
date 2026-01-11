import { Observer } from "./observer.ts";
import { isObserver } from "./is-observer.ts";
import { Observable } from "./observable.ts";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import type { SubjectConstructor } from "./subject-constructor.ts";

/**
 * Object interface that implements both the {@linkcode Observer} and {@linkcode Observable} interfaces.
 */
export type Subject<Value = unknown> = Observer<Value> & Observable<Value>;

/**
 * Flag indicating that a value is not thrown.
 * @internal Do NOT export.
 */
const notThrown = Symbol("Flag indicating that a value is not thrown.");

export const Subject: SubjectConstructor = class {
  readonly [Symbol.toStringTag] = "Subject";
  /**
   * Tracking the value that was thrown by the [producer](https://jsr.io/@xan/observable-core#producer), if any.
   */
  #thrown: unknown = notThrown;

  /**
   * Tracking a known list of unique {@linkcode Observer|observers}, so we don't have to clone them while
   * iterating to prevent reentrant behaviors.
   */
  #observersSnapshot?: ReadonlySet<Observer>;
  readonly #observers = new Set<Observer>();

  readonly #observer = new Observer({
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

  next(value: unknown): void {
    if (this instanceof Subject) this.#observer.next(value);
    else throw new InstanceofError("this", "Subject");
  }

  return(): void {
    if (this instanceof Subject) this.#observer.return();
    else throw new InstanceofError("this", "Subject");
  }

  throw(value: unknown): void {
    if (this instanceof Subject) this.#observer.throw(value);
    else throw new InstanceofError("this", "Subject");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof Subject)) {
      throw new InstanceofError("this", "Subject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#observable.subscribe(observer);
  }
};

Object.freeze(Subject);
Object.freeze(Subject.prototype);
