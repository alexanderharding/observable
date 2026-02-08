import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@observable/internal";
import { isObserver } from "./is-observer.ts";
import { Observer } from "./observer.ts";
import type { ObservableConstructor } from "./observable-constructor.ts";

/**
 * Object interface that defines a standard way for a [consumer](https://jsr.io/@observable/core#consumer)
 * to [observe](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
 */
export interface Observable<Value = unknown> {
  /**
   * The act of a [consumer](https://jsr.io/@observable/core#consumer) requesting to
   * [observe](https://jsr.io/@observable/core#observation) a [producer](https://jsr.io/@observable/core#producer).
   */
  subscribe(observer: Observer<Value>): void;
}

/**
 * A fixed string that is used to identify the {@linkcode Observable} class.
 * @internal Do NOT export.
 */
const stringTag = "Observable";

export const Observable: ObservableConstructor = class<Value> {
  readonly [Symbol.toStringTag] = stringTag;
  readonly #subscribe: (observer: Observer<Value>) => void;

  constructor(subscribe: (observer: Observer<Value>) => void) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof subscribe !== "function") {
      throw new ParameterTypeError(0, "Function");
    }
    Object.freeze(this);
    this.#subscribe = subscribe;
  }

  subscribe(observer: Observer<Value>): void {
    if (!(this instanceof Observable)) throw new InstanceofError("this", stringTag);
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");

    // We need to ensure that we are working with an Observer instance from this library
    // so the resulting behavior is predictable.
    observer = observer instanceof Observer ? observer : new Observer(observer);

    // If the Observer has been aborted there is nothing to do.
    if (observer.signal.aborted) return;

    // From this point on, all errors are pushed to the Observer. This includes
    // errors that occur while connecting to the producer, ensuring a consistent
    // error semantics for subscribe.
    try {
      this.#subscribe(observer);
    } catch (value) {
      observer.throw(value);
    }
  }
};

Object.freeze(Observable);
Object.freeze(Observable.prototype);
