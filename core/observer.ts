import {
  InstanceofError,
  isAbortSignal,
  isNil,
  isObject,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import type { ObserverConstructor } from "./observer-constructor.ts";

/**
 * Object interface that defines a standard way to [`consume`](https://jsr.io/@observable/core#consumer) a
 * sequence of values (either finite or infinite).
 */
// This is meant to reflect similar semantics as the Iterator protocol, while also supporting aborts.
// Note that the observer has different needs than an Iterator, so the interface and overall behavior
// is different.
export interface Observer<Value = unknown> {
  /**
   * The [consumer](https://jsr.io/@observable/core#consumer) is telling the [producer](https://jsr.io/@observable/core#producer)
   * it's no longer interested in receiving {@linkcode Value|values}.
   */
  readonly signal: AbortSignal;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is pushing a {@linkcode value} to the [consumer](https://jsr.io/@observable/core#consumer).
   */
  next(value: Value): void;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is telling the [consumer](https://jsr.io/@observable/core#consumer)
   * that it does not intend to {@linkcode next} any more values, and can perform any cleanup actions.
   */
  return(): void;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is telling the [consumer](https://jsr.io/@observable/core#consumer) that
   * it has encountered a {@linkcode value|problem}, does not intend to {@linkcode next} any more values, and can perform any cleanup actions.
   */
  throw(value: unknown): void;
}

export const Observer: ObserverConstructor = class {
  readonly [Symbol.toStringTag] = "Observer";
  readonly #observer?: Partial<Observer> | null;
  readonly #controller = new AbortController();
  readonly signal = this.#controller.signal;

  constructor(observer?: Partial<Observer> | Observer["next"] | null) {
    if (
      !isNil(observer) &&
      typeof observer !== "function" &&
      !isPartialObserver(observer)
    ) {
      const expected = "(Partial<Observer> or Observer['next'])";
      throw new ParameterTypeError(0, expected);
    }
    this.#observer = typeof observer === "function" ? { next: observer } : observer;
    if (isAbortSignal(this.#observer?.signal)) {
      this.signal = AbortSignal.any([this.signal, this.#observer.signal]);
    }
    Object.freeze(this);
  }

  next(value: unknown): void {
    if (!(this instanceof Observer)) {
      throw new InstanceofError("this", "Observer");
    }

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    try {
      this.#observer?.next?.(value);
    } catch (value) {
      this.throw(value);
    }
  }

  return(): void {
    if (!(this instanceof Observer)) {
      throw new InstanceofError("this", "Observer");
    }

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    // Abort this observer before pushing this notification in-case of reentrant code.
    this.#controller.abort();

    try {
      this.#observer?.return?.();
    } catch (value) {
      // Return is a terminal notification so if its handler throws, we have no choice but to report
      // it as unhandled.
      reportUnhandledError(value);
    }
  }

  throw(value: unknown): void {
    if (!(this instanceof Observer)) {
      throw new InstanceofError("this", "Observer");
    }

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    // Abort this observer before pushing this notification in-case of reentrant code.
    this.#controller.abort();

    try {
      if (this.#observer?.throw) this.#observer.throw(value);
      else throw value;
    } catch (value) {
      // Throw is a terminal notification so if its handler throws, we have no choice but to report
      // it as unhandled.
      reportUnhandledError(value);
    }
  }
};

Object.freeze(Observer);
Object.freeze(Observer.prototype);

/**
 * Reports an unhandled error asynchronously to prevent producer interference.
 * @internal Do NOT export.
 */
function reportUnhandledError(value: unknown): void {
  // Throw value asynchronously to ensure it does not interfere with
  // the library's execution. Ideally we'd report this to the process directly
  // and synchronously but there's not really generic cross-platform support
  // for this yet.
  globalThis.queueMicrotask(() => {
    throw value;
  });
}

/**
 * Checks if a {@linkcode value} is an object that implements _all_ or _some_ of the {@linkcode Observer} interface.
 * @internal Do NOT export.
 */
function isPartialObserver(value: unknown): value is Partial<Observer> {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof Observer ||
    (isObject(value) &&
      (!("next" in value) ||
        typeof value.next === "undefined" ||
        typeof value.next === "function") &&
      (!("return" in value) ||
        typeof value.return === "undefined" ||
        typeof value.return === "function") &&
      (!("throw" in value) ||
        typeof value.throw === "undefined" ||
        typeof value.throw === "function") &&
      (!("signal" in value) ||
        typeof value.signal === "undefined" ||
        isAbortSignal(value.signal)))
  );
}
