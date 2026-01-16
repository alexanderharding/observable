import { isObserver, isSubject, Observer, type Subject } from "@observable/core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { pipe } from "@observable/pipe";
import { take } from "@observable/take";
import { ReplaySubject } from "@observable/replay-subject";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject).
 */
export type BehaviorSubject<Value = unknown> =
  & Subject<Value>
  & Readonly<Record<"value", Value>>;

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
   * // console output:
   * // "next" 0
   *
   * subject.next(1);
   *
   * // console output:
   * // "next" 1
   *
   * subject.return();
   *
   * // console output:
   * // "return"
   *
   * subject.subscribe({
   *  signal: controller.signal,
   *  next: (value) => console.log("next", value),
   *  return: () => console.log("return"),
   *  throw: () => console.error("throw"),
   * });
   *
   * // console output:
   * // "next" 1
   * // "return"
   * ```
   */
  new <Value>(value: Value): BehaviorSubject<Value>;
  readonly prototype: BehaviorSubject;
}

export const BehaviorSubject: BehaviorSubjectConstructor = class<Value> {
  readonly [Symbol.toStringTag] = "BehaviorSubject";
  readonly #subject = new ReplaySubject<Value>(1);
  readonly signal = this.#subject.signal;

  constructor(value: Value) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    Object.freeze(this);
    this.#subject.next(value);
  }

  get value(): Value {
    if (this instanceof BehaviorSubject) {
      let value: Value;
      pipe(this.#subject, take(1)).subscribe(new Observer((v) => (value = v)));
      return value!;
    } else throw new InstanceofError("this", "BehaviorSubject");
  }

  next(value: Value): void {
    if (this instanceof BehaviorSubject) this.#subject.next(value);
    else throw new InstanceofError("this", "BehaviorSubject");
  }

  return(): void {
    if (this instanceof BehaviorSubject) this.#subject.return();
    else throw new InstanceofError("this", "BehaviorSubject");
  }

  throw(value: unknown): void {
    if (this instanceof BehaviorSubject) this.#subject.throw(value);
    else throw new InstanceofError("this", "BehaviorSubject");
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof BehaviorSubject)) {
      throw new InstanceofError("this", "BehaviorSubject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#subject.subscribe(observer);
  }
};

Object.freeze(BehaviorSubject);
Object.freeze(BehaviorSubject.prototype);

/**
 * Checks if a {@linkcode value} is an object that implements the {@linkcode BehaviorSubject} interface.
 * @example
 * ```ts
 * import { isBehaviorSubject, BehaviorSubject } from "@observable/behavior-subject";
 *
 * const subject = new BehaviorSubject(0);
 *
 * console.log(isBehaviorSubject(subject)); // true
 * ```
 * @example
 * ```ts
 * import { isBehaviorSubject, BehaviorSubject } from "@observable/behavior-subject";
 *
 * const custom: BehaviorSubject = {
 *   value: 0,
 *   signal: new AbortController().signal,
 *   next(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   return() {
 *     // Implementation omitted for brevity.
 *   },
 *   throw(value) {
 *     // Implementation omitted for brevity.
 *   },
 *   subscribe(observer) {
 *     // Implementation omitted for brevity.
 *   },
 * };
 *
 * console.log(isBehaviorSubject(custom)); // true
 * ```
 */
export function isBehaviorSubject(value: unknown): value is BehaviorSubject {
  if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
  return (
    value instanceof BehaviorSubject || (isSubject(value) && "value" in value)
  );
}
