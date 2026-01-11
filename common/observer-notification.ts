import type { Observer } from "@xan/observable-core";

/**
 * Represents any type of [`Observer`](https://jsr.io/@xan/observable-core/doc/~/Observer) notification
 * ([`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next),
 * [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return), or
 * [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw)).
 */
export type ObserverNotification<Value = unknown> = Readonly<
  | [type: Extract<"next", keyof Observer>, value: Value]
  | [type: Extract<"return", keyof Observer>]
  | [type: Extract<"throw", keyof Observer>, value: unknown]
>;
