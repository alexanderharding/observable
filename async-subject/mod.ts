import { isObserver, type Observer, type Subject } from "@observable/core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { flat } from "@observable/flat";
import { pipe } from "@observable/pipe";
import { ignoreElements } from "@observable/ignore-elements";
import { ReplaySubject } from "@observable/replay-subject";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type AsyncSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode AsyncSubject} factory.
 */
export interface AsyncSubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that buffers the most recent
   * [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value until [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) is called.
   * Once [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)ed, [`next`](https://jsr.io/@observable/core/doc/~/Observer.next) will be replayed
   * to late [`consumers`](https://jsr.io/@observable/core#consumer) upon [`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { AsyncSubject } from "@observable/async-subject";
   *
   * const subject = new AsyncSubject<number>();
   * const controller = new AbortController();
   *
   * subject.next(1);
   * subject.next(2);
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("next", value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * subject.next(3);
   *
   * subject.return();
   *
   * // Console output:
   * // "next" 3
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
   * // "next" 3
   * // "return"
   * ```
   */
  new (): AsyncSubject;
  new <Value>(): AsyncSubject<Value>;
  readonly prototype: AsyncSubject;
}

export const AsyncSubject: AsyncSubjectConstructor = class {
  readonly [Symbol.toStringTag] = "AsyncSubject";
  readonly #subject = new ReplaySubject(1);
  readonly signal = this.#subject.signal;
  readonly #observable = flat<unknown>([
    pipe(this.#subject, ignoreElements()),
    this.#subject,
  ]);

  constructor() {
    Object.freeze(this);
  }

  next(value: unknown): void {
    if (this instanceof AsyncSubject) this.#subject.next(value);
    else throw new InstanceofError("this", "AsyncSubject");
  }

  return(): void {
    if (this instanceof AsyncSubject) this.#subject.return();
    else throw new InstanceofError("this", "AsyncSubject");
  }

  throw(value: unknown): void {
    if (this instanceof AsyncSubject) {
      this.#subject.next(undefined);
      this.#subject.throw(value);
    } else throw new InstanceofError("this", "AsyncSubject");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof AsyncSubject)) {
      throw new InstanceofError("this", "AsyncSubject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#observable.subscribe(observer);
  }
};

Object.freeze(AsyncSubject);
Object.freeze(AsyncSubject.prototype);
