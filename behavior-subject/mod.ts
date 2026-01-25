import { isObserver, type Observer, type Subject } from "@observable/core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { ReplaySubject } from "@observable/replay-subject";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type BehaviorSubject<Value = unknown> = Subject<Value>;

/**
 * Object interface for a {@linkcode BehaviorSubject} factory.
 */
export interface BehaviorSubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that keeps track of it's current
   * value and replays it to [`consumers`](https://jsr.io/@observable/core#consumer) upon
   * [`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { BehaviorSubject } from "@observable/behavior-subject";
   *
   * const subject = new BehaviorSubject(0);
   * const controller = new AbortController();
   *
   * subject.subscribe({
   *  signal: controller.signal,
   *  next: (value) => console.log("next", value),
   *  return: () => console.log("return"),
   *  throw: () => console.error("throw"),
   * });
   *
   * // Console output:
   * // "next" 0
   *
   * subject.next(1);
   *
   * // Console output:
   * // "next" 1
   *
   * subject.return();
   *
   * // Console output:
   * // "return"
   *
   * subject.subscribe({
   *  signal: controller.signal,
   *  next: (value) => console.log("next", value),
   *  return: () => console.log("return"),
   *  throw: () => console.error("throw"),
   * });
   *
   * // Console output:
   * // "return"
   * ```
   */
  new <Value>(value: Value): BehaviorSubject<Value>;
  readonly prototype: BehaviorSubject;
}

/**
 * A fixed string that is used to identify the {@linkcode BehaviorSubject} class.
 * @internal Do NOT export.
 */
const stringTag = "BehaviorSubject";

export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
  readonly [Symbol.toStringTag] = stringTag;
  readonly #subject = new ReplaySubject<Value>(1);
  readonly signal = this.#subject.signal;

  constructor(value: Value) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    Object.freeze(this);
    this.#subject.next(value);
  }

  next(value: Value): void {
    if (this instanceof BehaviorSubject) this.#subject.next(value);
    else throw new InstanceofError("this", stringTag);
  }

  return(): void {
    if (this instanceof BehaviorSubject) this.#subject.return();
    else throw new InstanceofError("this", stringTag);
  }

  throw(value: unknown): void {
    if (this instanceof BehaviorSubject) this.#subject.throw(value);
    else throw new InstanceofError("this", stringTag);
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof BehaviorSubject)) throw new InstanceofError("this", stringTag);
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#subject.subscribe(observer);
  }
};

Object.freeze(BehaviorSubject);
Object.freeze(BehaviorSubject.prototype);
