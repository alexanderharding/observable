import { isObserver, type Observer, type Subject } from "@observable/core";
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
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that keeps track of its current
   * {@linkcode Value|value} and [pushes](https://jsr.io/@observable/core#push) it upon [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).
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
  static {
    Object.freeze(this);
    Object.freeze(this.prototype);
  }

  readonly [Symbol.toStringTag] = stringTag;
  readonly #subject = new ReplaySubject<Value>(1);
  readonly signal = this.#subject.signal;

  constructor(value: Value) {
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    Object.freeze(this);
    this.#subject.next(value);
  }

  next(value: Value): void {
    if (!(this instanceof BehaviorSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    // No arguments.length check because Value may be void, making next() with no args valid.

    this.#subject.next(value);
  }

  return(): void {
    if (this instanceof BehaviorSubject) this.#subject.return();
    else throw new TypeError(`'this' is not instanceof '${stringTag}'`);
  }

  throw(value: unknown): void {
    if (!(this instanceof BehaviorSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    this.#subject.throw(value);
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof BehaviorSubject)) {
      throw new TypeError(`'this' is not instanceof '${stringTag}'`);
    }
    if (!arguments.length) throw new TypeError("1 argument required but 0 present");
    if (!isObserver(observer)) throw new TypeError("Parameter 1 is not of type 'Observer'");
    this.#subject.subscribe(observer);
  }
};
