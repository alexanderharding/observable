import { isObserver, type Observer, Subject } from "@observable/core";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type BroadcastSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode BroadcastSubject} factory.
 */
export interface BroadcastSubjectConstructor {
  /**
   * Creates and returns an object that acts as a variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject) whose values
   * are [`structured cloned`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) and [pushed](https://jsr.io/@observable/core#push)
   * only to [consumers](https://jsr.io/@observable/core#consumer) of _other_ {@linkcode BroadcastSubject}s with the same
   * {@linkcode name} even if they are in different browsing contexts (e.g. browser tabs).
   * @example
   * ```ts
   * import { BroadcastSubject } from "@observable/broadcast-subject";
   *
   * // Setup subjects
   * const name = "test";
   * const controller = new AbortController();
   * const subject1 = new BroadcastSubject<number>(name);
   * const subject2 = new BroadcastSubject<number>(name);
   *
   * // Subscribe to subjects
   * subject1.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject1 received", value, "from subject1"),
   *   return: () => console.log("subject1 returned"),
   *   throw: (value) => console.log("subject1 threw", value),
   * });
   * subject2.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject2 received", value, "from subject2"),
   *   return: () => console.log("subject2 returned"),
   *   throw: (value) => console.log("subject2 threw", value),
   * });
   *
   * subject1.next(1); // subject2 received 1 from subject1
   * subject2.next(2); // subject1 received 2 from subject2
   * subject2.return(); // subject2 returned
   * subject1.next(3); // No console output since subject2 is already returned
   * ```
   */
  new (name: string): BroadcastSubject;
  /**
   * Creates and returns an object that acts as a variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject) whose {@linkcode Value|values}
   * are [`structured cloned`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) and [pushed](https://jsr.io/@observable/core#push)
   * only to [consumers](https://jsr.io/@observable/core#consumer) of _other_ {@linkcode BroadcastSubject}s with the same
   * {@linkcode name} even if they are in different browsing contexts (e.g. browser tabs).
   * @example
   * ```ts
   * import { BroadcastSubject } from "@observable/broadcast-subject";
   *
   * // Setup subjects
   * const name = "test";
   * const controller = new AbortController();
   * const subject1 = new BroadcastSubject<number>(name);
   * const subject2 = new BroadcastSubject<number>(name);
   *
   * // Subscribe to subjects
   * subject1.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject1 received", value, "from subject1"),
   *   return: () => console.log("subject1 returned"),
   *   throw: (value) => console.log("subject1 threw", value),
   * });
   * subject2.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject2 received", value, "from subject2"),
   *   return: () => console.log("subject2 returned"),
   *   throw: (value) => console.log("subject2 threw", value),
   * });
   *
   * subject1.next(1); // subject2 received 1 from subject1
   * subject2.next(2); // subject1 received 2 from subject2
   * subject2.return(); // subject2 returned
   * subject1.next(3); // No console output since subject2 is already returned
   * ```
   */
  new <Value>(name: string): BroadcastSubject<Value>;
  readonly prototype: BroadcastSubject;
}

/**
 * A fixed UUID that is used to scope the name of the underlying {@linkcode BroadcastChannel}. This helps ensure that our
 * {@linkcode BroadcastSubject}'s only communicate with other {@linkcode BroadcastSubject}'s from this library.
 * @internal Do NOT export.
 */
const namespace = "394068c9-9d2c-45cb-81d2-a09197594a9d";

/**
 * A fixed string that is used to identify the {@linkcode BroadcastSubject} class.
 * @internal Do NOT export.
 */
const stringTag = "BroadcastSubject";

export const BroadcastSubject: BroadcastSubjectConstructor = class<Value> {
  static {
    Object.freeze(this);
    Object.freeze(this.prototype);
  }

  readonly [Symbol.toStringTag] = stringTag;
  readonly #subject = new Subject<Value>();
  readonly signal = this.#subject.signal;
  readonly #channel: BroadcastChannel;

  constructor(name: string) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (typeof name !== "string") throw new TypeError("Parameter 1 is not of type 'String'");
    Object.freeze(this);
    this.#channel = new BroadcastChannel(`${name}:${namespace}`);
    this.signal.addEventListener("abort", () => this.#channel.close(), { once: true });
    this.#channel.onmessage = (event) => this.#subject.next(event.data);
    this.#channel.onmessageerror = (event) => this.#subject.throw(event);
  }

  next(value: Value): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    // No arguments.length check because Value may be void, making next() with no args valid.

    try {
      this.#channel.postMessage(value);
    } catch (error) {
      this.throw(error);
    }
  }

  return(): void {
    if (this instanceof BroadcastSubject) this.#subject.return();
    else throw new TypeError(`'this' is not instanceof '${stringTag}'`);
  }

  throw(value: unknown): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    this.#subject.throw(value);
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObserver(observer)) throw new TypeError("Parameter 1 is not of type 'Observer'");
    this.#subject.subscribe(observer);
  }
};
