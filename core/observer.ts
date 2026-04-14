/**
 * Object interface that defines a standard way to [consume](https://jsr.io/@observable/core#consumer)
 * a sequence of values (either finite or infinite).
 */
// This is meant to reflect similar semantics as the Iterator protocol, while also supporting aborts.
// Note that the observer has different needs than an Iterator, so the interface and overall behavior
// is different.
export interface Observer<Value = unknown> {
  /**
   * The [consumer](https://jsr.io/@observable/core#consumer) is telling the
   * [producer](https://jsr.io/@observable/core#producer) that it's no longer interested in receiving
   * {@linkcode Value|values}.
   */
  readonly signal: AbortSignal;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is pushing a {@linkcode value} to the
   * [consumer](https://jsr.io/@observable/core#consumer).
   */
  next(value: Value): void;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is telling the [consumer](https://jsr.io/@observable/core#consumer)
   * that it does not intend to {@linkcode next} any more values.
   */
  return(): void;
  /**
   * The [producer](https://jsr.io/@observable/core#producer) is telling the [consumer](https://jsr.io/@observable/core#consumer)
   * that it has encountered a {@linkcode value|problem} and does not intend to {@linkcode next} any more values.
   */
  throw(value: unknown): void;
}

/**
 * Object interface for an {@linkcode Observer} factory.
 */
export interface ObserverConstructor {
  /**
   * Creates and return an object that provides a standard way to [consume](https://jsr.io/@observable/core#consumer)
   * a sequence of values (either finite or infinite).
   * ```ts
   * import { Observer } from "@observable/core";
   *
   * const observer = new Observer<0>({
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   * const timeout = setTimeout(() => {
   *   observer.next(0);
   *   observer.return();
   *   // The following "next" and "throw" method calls are no-ops since we already returned
   *   // and are only here for demonstration purposes.
   *   observer.next(0);
   *   observer.throw(new Error("Should not be thrown"));
   * }, 100);
   * observer.signal.addEventListener("abort", () => clearTimeout(timeout), {
   *   once: true,
   * });
   *
   * // Console output (after 100ms):
   * // "next" 0
   * // "return"
   * ```
   */
  new <Value>(
    observer?: Partial<Observer<Value>> | Observer<Value>["next"] | null,
  ): Observer<Value>;
  readonly prototype: Observer;
}

/**
 * A fixed string that is used to identify the {@linkcode Observer} class.
 * @internal Do NOT export.
 */
const stringTag = "Observer";

export const Observer: ObserverConstructor = class<Value> {
  static {
    Object.freeze(this);
    Object.freeze(this.prototype);
  }

  readonly [Symbol.toStringTag] = stringTag;
  readonly #observer?: Partial<Observer<Value>> | null;
  readonly #controller = new AbortController();
  readonly signal = this.#controller.signal;

  constructor(observer?: Partial<Observer<Value>> | Observer<Value>["next"] | null) {
    if (
      (typeof observer !== "undefined" && observer !== null) &&
      typeof observer !== "function" &&
      !isPartialObserver(observer)
    ) {
      throw new TypeError("Parameter 1 is not of type '(Partial<Observer> or Observer['next'])'");
    }
    this.#observer = typeof observer === "function" ? { next: observer } : observer;
    if (isAbortSignal(this.#observer?.signal)) {
      this.signal = AbortSignal.any([this.signal, this.#observer.signal]);
    }
    Object.freeze(this);
  }

  next(value: Value): void {
    if (!(this instanceof Observer)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    // No arguments.length check because Value may be void, making next() with no args valid.

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    // Wrap in a try/catch to prevent producer interference.
    try {
      this.#observer?.next?.(value);
    } catch (value) {
      this.throw(value);
    }
  }

  return(): void {
    if (!(this instanceof Observer)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    // Abort this observer before pushing this notification in-case of reentrant code
    // omitting the abort reason to separate concerns between teardown logic and callback
    // handlers.
    this.#controller.abort();

    // Wrap in a try/catch to prevent producer interference.
    try {
      this.#observer?.return?.();
    } catch (value) {
      // Return is a terminal notification so if its handler throws, we have no choice but to report
      // it as an unhandled error.
      reportUnhandledError(value);
    }
  }

  throw(value: unknown): void {
    if (!(this instanceof Observer)) throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");

    // If this observer has been aborted there is nothing to do.
    if (this.signal.aborted) return;

    // Abort this observer before pushing this notification in-case of reentrant code
    // omitting the abort reason to separate concerns between teardown logic and callback
    // handlers.
    this.#controller.abort();

    if (this.#observer?.throw) {
      // Wrap in a try/catch to prevent producer interference.
      try {
        this.#observer.throw(value);
      } catch (value) {
        // Throw is a terminal notification so if its handler throws, we have no choice but to report
        // it as an unhandled error.
        reportUnhandledError(value);
      }
    } else reportUnhandledError(value);
  }
};

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode Observer} interface.
 * @example
 * ```ts
 * import { isObserver, Observer } from "@observable/core";
 *
 * const instance = new Observer((value) => {
 *   // Implementation omitted for brevity.
 * });
 * isObserver(instance); // true
 *
 * const literal: Observer = {
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
 * };
 * isObserver(literal); // true
 * ```
 */
export function isObserver(value: unknown): value is Observer {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    value instanceof Observer ||
    ((typeof value === "object" && value !== null) &&
      "next" in value &&
      typeof value.next === "function" &&
      "return" in value &&
      typeof value.return === "function" &&
      "throw" in value &&
      typeof value.throw === "function" &&
      "signal" in value &&
      isAbortSignal(value.signal))
  );
}

/**
 * Reports an unhandled error asynchronously to prevent
 * [producer interference](https://jsr.io/@observable/core#producer-interference).
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
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    value instanceof Observer ||
    ((typeof value === "object" && value !== null) &&
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

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode AbortSignal} interface.
 * @internal Do NOT export
 */
function isAbortSignal(value: unknown): value is AbortSignal {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    value instanceof AbortSignal ||
    (isEventTarget(value) &&
      "aborted" in value &&
      typeof value.aborted === "boolean" &&
      "onabort" in value &&
      (typeof value.onabort === "function" || value.onabort === null) &&
      "throwIfAborted" in value &&
      typeof value.throwIfAborted === "function" &&
      "reason" in value)
  );
}

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode EventTarget} interface.
 * @internal Do NOT export
 */
function isEventTarget(value: unknown): value is EventTarget {
  if (!arguments.length) throw new TypeError("1 argument required but 0 present");
  return (
    (typeof value === "object" && value !== null) &&
    "addEventListener" in value &&
    typeof value.addEventListener === "function" &&
    "removeEventListener" in value &&
    typeof value.removeEventListener === "function" &&
    "dispatchEvent" in value &&
    typeof value.dispatchEvent === "function"
  );
}
