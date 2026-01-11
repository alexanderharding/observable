/**
 * Represents any type of [`Observer`](https://jsr.io/@xan/observable-core/doc/~/Observer) notification
 * ([`next`](https://jsr.io/@xan/observable-core/doc/~/Observer.next),
 * [`return`](https://jsr.io/@xan/observable-core/doc/~/Observer.return), or
 * [`throw`](https://jsr.io/@xan/observable-core/doc/~/Observer.throw)).
 */
export type ObserverNotification<Value = unknown> = Readonly<
  [type: "N", value: Value] | [type: "R"] | [type: "T", value: unknown]
>;
