import type { BehaviorSubject } from "./behavior-subject.ts";

/**
 * Object interface for a {@linkcode BehaviorSubject} factory.
 */
export interface BehaviorSubjectConstructor {
  /**
   * Creates and returns an object that acts as a [`Subject`](https://jsr.io/@xan/observable-core/doc/~/Subject) that keeps track of it's current
   * value and replays it to [`consumers`](https://jsr.io/@xan/observable-core#consumer) upon
   * [`subscription`](https://jsr.io/@xan/observable-core/doc/~/Observable.subscribe).
   * @example
   * ```ts
   * import { BehaviorSubject } from "@xan/observable-common";
   *
   * const subject = new BehaviorSubject(0);
   * const controller = new AbortController();
   *
   * subject.subscribe({
   *  signal: controller.signal,
   *  next: (value) => console.log(value),
   *  return: () => console.log("return"),
   *  throw: () => console.error("throw"),
   * });
   *
   * // console output:
   * // 0
   *
   * subject.next(1);
   *
   * // console output:
   * // 1
   *
   * subject.return();
   *
   * // console output:
   * // return
   *
   * subject.subscribe({
   *  signal: controller.signal,
   *  next: (value) => console.log(value),
   *  return: () => console.log("return"),
   *  throw: () => console.error("throw"),
   * });
   *
   * // console output:
   * // 1
   * // return
   * ```
   */
  new <Value>(value: Value): BehaviorSubject<Value>;
  readonly prototype: BehaviorSubject;
}
