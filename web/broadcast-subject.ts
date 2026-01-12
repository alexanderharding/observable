import { isObserver, type Observer, Subject } from "@xan/observable-core";
import {
  InstanceofError,
  MinimumArgumentsRequiredError,
  ParameterTypeError,
} from "@xan/observable-internal";
import type { BroadcastSubjectConstructor } from "./broadcast-subject-constructor.ts";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject).
 */
export type BroadcastSubject<Value = unknown> = Subject<Value>;

/**
 * A fixed UUID that is used to scope the name of the underlying {@linkcode BroadcastChannel}. This helps ensure that our
 * {@linkcode BroadcastSubject}'s only communicate with other {@linkcode BroadcastSubject}'s from this library.
 * @internal Do NOT export.
 */
const namespace = "394068c9-9d2c-45cb-81d2-a09197594a9d";

export const BroadcastSubject: BroadcastSubjectConstructor = class {
  readonly [Symbol.toStringTag] = "BroadcastSubject";
  readonly #subject = new Subject();
  readonly signal = this.#subject.signal;
  readonly #channel: BroadcastChannel;

  constructor(name: string) {
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (typeof name !== "string") throw new ParameterTypeError(0, "String");
    Object.freeze(this);
    this.#channel = new BroadcastChannel(`${namespace}:${name}`);
    this.signal.addEventListener("abort", () => this.#channel.close(), {
      once: true,
    });
    this.#channel.onmessage = (event) => this.#subject.next(event.data);
    this.#channel.onmessageerror = (event) => this.#subject.throw(event);
  }

  next(value: unknown): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new InstanceofError("this", "BroadcastSubject");
    }
    try {
      this.#channel.postMessage(value);
    } catch (error) {
      this.#subject.throw(error);
    }
  }

  return(): void {
    if (this instanceof BroadcastSubject) this.#subject.return();
    else throw new InstanceofError("this", "BroadcastSubject");
  }

  throw(value: unknown): void {
    if (this instanceof BroadcastSubject) this.#subject.throw(value);
    else throw new InstanceofError("this", "BroadcastSubject");
  }

  subscribe(observer: Observer): void {
    if (!(this instanceof BroadcastSubject)) {
      throw new InstanceofError("this", "BroadcastSubject");
    }
    if (arguments.length === 0) throw new MinimumArgumentsRequiredError();
    if (!isObserver(observer)) throw new ParameterTypeError(0, "Observer");
    this.#subject.subscribe(observer);
  }
};

Object.freeze(BroadcastSubject);
Object.freeze(BroadcastSubject.prototype);
