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
import type { AsyncSubjectConstructor } from "./async-subject-constructor.ts";

/**
 * Object type that acts as a variant of [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject).
 */
export type AsyncSubject<Value = unknown> = Subject<Value>;

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
