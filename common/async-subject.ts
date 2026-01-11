import { isObserver, type Observer, type Subject } from "@xan/observable-core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import { flat } from "./flat.ts";
import { pipe } from "./pipe.ts";
import { ignoreElements } from "./ignore-elements.ts";
import { ReplaySubject } from "./replay-subject.ts";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject).
 */
export type AsyncSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for an {@linkcode AsyncSubject} factory.
 */
export interface AsyncSubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject) that buffers the most recent
   * [`nexted`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) value until [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return) is called.
   * Once [`returned`](https://jsr.io/@xan/observable-core/doc/~/Observer.return), [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) will be replayed
   * to late [`consumers`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe) upon [`subscription`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { AsyncSubject } from "@xan/observable-common";
   * import { Observer } from "@xan/observable-core";
   *
   * const subject = new AsyncSubject<number>();
   * subject.next(1);
   * subject.next(2);
   *
   * subject.subscribe(new Observer((value) => console.log(value)));
   *
   * subject.next(3);
   *
   * subject.return(); // Console output: 3
   *
   * subject.subscribe(new Observer((value) => console.log(value))); // Console output: 3
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
