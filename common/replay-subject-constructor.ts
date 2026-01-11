import { ReplaySubject } from "./replay-subject.ts";

/**
 * Object interface for an {@linkcode ReplaySubject} factory.
 */
export interface ReplaySubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject) that replays
   * buffered [`nexted`](https://jsr.io/@xan/observable-core/doc/~/Observer.next) values upon
   * [`subscription`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { ReplaySubject } from "@xan/observable-common";
   *
   * const subject = new ReplaySubject<number>(3);
   * const controller = new AbortController();
   *
   * subject.next(1); // Stored in buffer
   * subject.next(2); // Stored in buffer
   * subject.next(3); // Stored in buffer
   * subject.next(4); // Stored in buffer and 1 gets trimmed off
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // 2
   * // 3
   * // 4
   *
   * // Values pushed after the subscribe will emit immediately
   * // unless the subject is already finalized.
   * subject.next(5); // Stored in buffer and 2 gets trimmed off
   *
   * // Console output:
   * // 5
   *
   * subject.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log(value),
   *   return: () => console.log("return"),
   *   throw: (value) => console.log("throw", value),
   * });
   *
   * // Console output:
   * // 3
   * // 4
   * // 5
   * ```
   */
  new <Value>(bufferSize: number): ReplaySubject<Value>;
  readonly prototype: ReplaySubject;
}
