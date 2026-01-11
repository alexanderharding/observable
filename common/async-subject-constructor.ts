import type { AsyncSubject } from "./async-subject.ts";

/**
 * Object interface for an {@linkcode AsyncSubject} factory.
 */
export interface AsyncSubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject) that buffers the most recent
   * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed value until [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return) is called.
   * Once [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return)ed, [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) will be replayed
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
