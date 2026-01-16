import { isObserver, type Observer, Subject } from "@observable/core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type BroadcastSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode BroadcastSubject} factory.
 */
export interface BroadcastSubjectConstructor {
  /**
   * Creates and returns a variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject). When values
   * are [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed, they are
   * {@linkcode structuredClone|structured cloned} and sent only to [consumers](https://jsr.io/@observable/core#consumer)
   * of _other_ {@linkcode BroadcastSubject} instances with the same {@linkcode name} even if they are in different browsing
   * contexts (e.g. browser tabs). Logically, [consumers](https://jsr.io/@observable/core#consumer) of the
   * {@linkcode BroadcastSubject} do not receive it's _own_
   * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values.
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
  new <Value>(name: string): BroadcastSubject<Value>;
  readonly prototype: BroadcastSubject;
}

/**
 * A fixed UUID that is used to scope the name of the underlying {@linkcode BroadcastChannel}. This helps ensure that our
 * {@linkcode BroadcastSubject}'s only communicate with other {@linkcode BroadcastSubject}'s from this library.
 * @internal Do NOT export.
 */
const namespace = "394068c9-9d2c-45cb-81d2-a09197594a9d";

export const BroadcastSubject: BroadcastSubjectConstructor = class {
  readonly [Symbol.toStringTag] = "BroadcastSubject";
  readonly #subject = new Subject();
  readonly signal = this.#subject.signal;
  readonly #channel: BroadcastChannel;

  constructor(name: string) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof name !== "string") throw new ParameterTypeError(0, "String");
    Object.freeze(this);
    this.#channel = new BroadcastChannel(`${namespace}:${name}`);
    this.signal.addEventListener("abort", () => this.#channel.close(), {
      once: true,
    });
    this.#channel.onmessage = (event) => this.#subject.next(event.data);
    this.#channel.onmessageerror = (event) => this.#subject.throw(event);
  }

  next(value: unknown): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new InstanceofError("this", "BroadcastSubject");
    }
    try {
      this.#channel.postMessage(value);
    } catch (error) {
      this.#subject.throw(error);
    }
  }

  return(): void {
    if (this instanceof BroadcastSubject) this.#subject.return();
    else throw new InstanceofError("this", "BroadcastSubject");
  }

  throw(value: unknown): void {
    if (this instanceof BroadcastSubject) this.#subject.throw(value);
    else throw new InstanceofError("this", "BroadcastSubject");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new InstanceofError("this", "BroadcastSubject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#subject.subscribe(observer);
  }
};

Object.freeze(BroadcastSubject);
Object.freeze(BroadcastSubject.prototype);
