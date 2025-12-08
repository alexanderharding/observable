import { from, isObserver, type Observer } from "@xan/observer";
import type { ObservableConstructor } from "./observable-constructor.ts";

/**
 * Object interface that acts as a template for connecting an [`Observer`](https://jsr.io/@xan/observer/doc/~/Observer), as a
 * [`consumer`](https://jsr.io/@xan/observer#consumer), to a [`producer`](https://jsr.io/@xan/observer#producer),
 * via a {@linkcode Observable.subscribe|subscribe} action.
 */
export interface Observable<Value = unknown> {
  /**
   * The act of a [`consumer`](https://jsr.io/@xan/observer#consumer) requesting from an
   * {@linkcode Observable|observable} to set up a [`subscription`](https://jsr.io/@xan/observer#subscription)
   * so that it may [`observe`](https://jsr.io/@xan/observer#observation) a [`producer`](https://jsr.io/@xan/observer#producer).
   */
  subscribe(observer: Observer<Value>): void;
}

export const Observable: ObservableConstructor = class {
  readonly [Symbol.toStringTag] = "Observable";
  readonly #subscribe: (observer: Observer) => void;

  constructor(subscribe: (observer: Observer) => void) {
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (typeof subscribe !== "function") {
      throw new TypeError("Parameter 1 is not of type 'Function'");
    }
    Object.freeze(this);
    this.#subscribe = subscribe;
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof Observable)) {
      throw new TypeError("'this' is not instanceof 'Observable'");
    }
    if (arguments.length === 0) {
      throw new TypeError("1 argument required but 0 present");
    }
    if (!isObserver(observer)) {
      throw new TypeError("Parameter 1 is not of type 'Observer'");
    }
    observer = from(observer);
    try {
      if (!observer.signal.aborted) this.#subscribe(observer);
    } catch (value) {
      observer.throw(value);
    }
  }
};

Object.freeze(Observable);
Object.freeze(Observable.prototype);
