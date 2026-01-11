import { isObserver, type Observable, type Observer, Subject } from "@xan/observable-core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import { flat } from "./flat.ts";
import { defer } from "./defer.ts";
import { of } from "./of.ts";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject).
 */
export type ReplaySubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode ReplaySubject} factory.
 */
export interface ReplaySubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject) that replays
   * buffered [`nexted`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) values upon
   * [`subscription`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { ReplaySubject } from "@xan/observable-common";
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
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // 2
   * // 3
   * // 4
   *
   * // Values pushed after the subscribe will emit immediately
   * // unless the subject is already finalized.
   * subject.next(5); // Stored in buffer and 2 gets trimmed off
   *
   * // Console output:
   * // 5
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // 3
   * // 4
   * // 5
   * ```
   */
  new <Value>(bufferSize: number): ReplaySubject<Value>;
  readonly prototype: ReplaySubject;
}

export const ReplaySubject: ReplaySubjectConstructor = class {
  readonly [Symbol.toStringTag] = "ReplaySubject";
  readonly #bufferSize: number;
  /**
   * Tracking a known list of buffered values as an Observable, so we don't have to clone
   * them while iterating to prevent reentrant behaviors.
   */
  #bufferSnapshot?: Observable;
  readonly #buffer: Array<unknown> = [];
  readonly #subject = new Subject();
  readonly signal = this.#subject.signal;
  readonly #observable = flat([
    defer(() => (this.#bufferSnapshot ??= of(this.#buffer.slice()))),
    this.#subject,
  ]);

  constructor(bufferSize: number) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof bufferSize !== "number") {
      throw new ParameterTypeError(0, "Number");
    }
    Object.freeze(this);
    this.#bufferSize = Math.max(1, Math.floor(bufferSize));
  }

  next(value: unknown): void {
    if (!(this instanceof ReplaySubject)) {
      throw new InstanceofError("this", "ReplaySubject");
    }
    if (!this.signal.aborted) {
      // Add the next value to the buffer.
      const length = this.#buffer.push(value);
      // Trim the buffer, if needed.
      if (length > this.#bufferSize) this.#buffer.shift();
      // Reset the buffer snapshot since it's now stale.
      this.#bufferSnapshot = undefined;
    }
    this.#subject.next(value);
  }

  return(): void {
    if (this instanceof ReplaySubject) this.#subject.return();
    else throw new InstanceofError("this", "ReplaySubject");
  }

  throw(value: unknown): void {
    if (this instanceof ReplaySubject) this.#subject.throw(value);
    else throw new InstanceofError("this", "ReplaySubject");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof ReplaySubject)) {
      throw new InstanceofError("this", "ReplaySubject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#observable.subscribe(observer);
  }
};

Object.freeze(ReplaySubject);
Object.freeze(ReplaySubject.prototype);
