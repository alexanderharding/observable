import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { isObserver } from "./is-observer.ts";
import { Observer } from "./observer.ts";
import type { ObservableConstructor } from "./observable-constructor.ts";

/**
 * Object interface that acts as a template for connecting an {@linkcode Observer}, as a
 * [consumer](https://jsr.io/@observable/core#consumer), to a [producer](https://jsr.io/@observable/core#producer),
 * via a {@linkcode Observable.subscribe|subscribe} action.
 */
export interface Observable<Value = unknown> {
  /**
   * The act of a [consumer](https://jsr.io/@observable/core#consumer) requesting from an
   * {@linkcode Observable} to set up a [`subscription`](https://jsr.io/@observable/core#subscription)
   * so that it may [`observe`](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
   */
  subscribe(observer: Observer<Value>): void;
}

/**
 * A fixed string that is used to identify the {@linkcode Observable} class.
 * @internal Do NOT export.
 */
const stringTag = "Observable";

export const Observable: ObservableConstructor = class {
  readonly [Symbol.toStringTag] = stringTag;
  readonly #subscribe: (observer: Observer) => void;

  constructor(subscribe: (observer: Observer) => void) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof subscribe !== "function") {
      throw new ParameterTypeError(0, "Function");
    }
    Object.freeze(this);
    this.#subscribe = subscribe;
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof Observable)) throw new InstanceofError("this", stringTag);
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    observer = observer instanceof Observer ? observer : new Observer(observer);
    if (observer.signal.aborted) return;
    try {
      this.#subscribe(observer);
    } catch (value) {
      observer.throw(value);
    }
  }
};

Object.freeze(Observable);
Object.freeze(Observable.prototype);
