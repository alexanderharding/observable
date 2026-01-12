import type { BroadcastSubject } from "./broadcast-subject.ts";

/**
 * Object interface for an {@linkcode BroadcastSubject} factory.
 */
export interface BroadcastSubjectConstructor {
  /**
   * Creates and returns a variant of [`Subject`](https://jsr.io/@xan/subject/doc/~/Subject). When values
   * are [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed, they are
   * {@linkcode structuredClone|structured cloned} and sent only to [consumers](https://jsr.io/@xan/observable-core#consumer)
   * of _other_ {@linkcode BroadcastSubject} instances with the same {@linkcode name} even if they are in different browsing
   * contexts (e.g. browser tabs). Logically, [consumers](https://jsr.io/@xan/observable-core#consumer) of the
   * {@linkcode BroadcastSubject} do not receive it's _own_
   * [`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next)ed values.
   * @example
   * ```ts
   * import { BroadcastSubject } from "@xan/observable-web";
   *
   * // Setup subjects
   * const name = "test";
   * const controller = new AbortController();
   * const subject1 = new BroadcastSubject<number>(name);
   * const subject2 = new BroadcastSubject<number>(name);
   *
   * // Subscribe to subjects
   * subject1.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject1 received", value, "from subject1"),
   *   return: () => console.log("subject1 returned"),
   *   throw: (value) => console.log("subject1 threw", value),
   * });
   * subject2.subscribe({
   *   signal: controller.signal,
   *   next: (value) => console.log("subject2 received", value, "from subject2"),
   *   return: () => console.log("subject2 returned"),
   *   throw: (value) => console.log("subject2 threw", value),
   * });
   *
   * subject1.next(1); // subject2 received 1 from subject1
   * subject2.next(2); // subject1 received 2 from subject2
   * subject2.return(); // subject2 returned
   * subject1.next(3); // No console output since subject2 is already returned
   * ```
   */
  new (name: string): BroadcastSubject;
  new <Value>(name: string): BroadcastSubject<Value>;
  readonly prototype: BroadcastSubject;
}
