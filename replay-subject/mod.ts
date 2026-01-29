import { isObserver, type Observable, type Observer, Subject } from "@observable/core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { flat } from "@observable/flat";
import { defer } from "@observable/defer";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";
import { empty } from "@observable/empty";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type ReplaySubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode ReplaySubject} factory.
 */
export interface ReplaySubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that replays
   * {@linkcode count} buffered [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values upon
   * [`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { ReplaySubject } from "@observable/replay-subject";
   *
   * const subject = new ReplaySubject<number>(3);
   * const controller = new AbortController();
   *
   * subject.next(1); // Stored in buffer
   * subject.next(2); // Stored in buffer
   * subject.next(3); // Stored in buffer
   * subject.next(4); // Stored in buffer and 1 gets trimmed off
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // "next" 2
   * // "next" 3
   * // "next" 4
   *
   * // Values pushed after the subscribe will emit immediately
   * // unless the subject is already finalized.
   * subject.next(5); // Stored in buffer and 2 gets trimmed off
   *
   * // Console output:
   * // "next" 5
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // "next" 3
   * // "next" 4
   * // "next" 5
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
   */
  new <Value>(count: number): ReplaySubject<Value>;
  readonly prototype: ReplaySubject;
}

/**
 * A fixed string that is used to identify the {@linkcode ReplaySubject} class.
 * @internal Do NOT export.
 */
const stringTag = "ReplaySubject";

export const ReplaySubject: ReplaySubjectConstructor = class {
  readonly [Symbol.toStringTag] = stringTag;
  readonly #count: number;
  /**
   * Tracking a known list of buffered values as an Observable, so we don't have to clone
   * them while iterating to prevent reentrant behaviors.
   */
  #bufferSnapshot?: Observable = empty;
  readonly #buffer: Array<unknown> = [];
  readonly #subject = new Subject();
  readonly signal = this.#subject.signal;
  readonly #observable = flat([
    defer(() => (this.#bufferSnapshot ??= pipe(this.#buffer.slice(), ofIterable()))),
    this.#subject,
  ]);

  constructor(count: number) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof count !== "number") {
      throw new ParameterTypeError(0, "Number");
    }
    Object.freeze(this);
    (this.#count = count) >= 0 ? this.#bufferSnapshot = undefined : this.return();
    if (this.signal.aborted || this.#count === 0) return;
    this.signal.addEventListener("abort", () => {
      this.#buffer.length = 0;
      this.#bufferSnapshot = empty;
    }, { once: true });
  }

  next(value: unknown): void {
    if (!(this instanceof ReplaySubject)) throw new InstanceofError("this", stringTag);
    if (!this.signal.aborted && this.#count > 0) {
      // Add the next value to the buffer.
      const length = this.#buffer.push(value);
      // Trim the buffer, if needed.
      if (length > this.#count) this.#buffer.shift();
      // Reset the buffer snapshot since it's now stale.
      this.#bufferSnapshot = undefined;
    }
    this.#subject.next(value);
  }

  return(): void {
    if (this instanceof ReplaySubject) this.#subject.return();
    else throw new InstanceofError("this", stringTag);
  }

  throw(value: unknown): void {
    if (this instanceof ReplaySubject) this.#subject.throw(value);
    else throw new InstanceofError("this", stringTag);
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof ReplaySubject)) throw new InstanceofError("this", stringTag);
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#observable.subscribe(observer);
  }
};

Object.freeze(ReplaySubject);
Object.freeze(ReplaySubject.prototype);
