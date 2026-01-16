# @observable/broadcast-subject

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject). When values are
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed, they are
[`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone)d and sent only
to [consumers](https://jsr.io/@observable/core#consumer) of _other_ `BroadcastSubject` instances
with the same name even if they are in different browsing contexts (e.g. browser tabs). Logically,
[consumers](https://jsr.io/@observable/core#consumer) of the `BroadcastSubject` do not receive its
_own_ [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values.

## Example

```ts
import { BroadcastSubject } from "@observable/broadcast-subject";

// Setup subjects
const name = "test";
const controller = new AbortController();
const subject1 = new BroadcastSubject<number>(name);
const subject2 = new BroadcastSubject<number>(name);

// Subscribe to subjects
subject1.subscribe({
  signal: controller.signal,
  next: (value) => console.log("subject1 received", value, "from subject1"),
  return: () => console.log("subject1 returned"),
  throw: (value) => console.log("subject1 threw", value),
});
subject2.subscribe({
  signal: controller.signal,
  next: (value) => console.log("subject2 received", value, "from subject2"),
  return: () => console.log("subject2 returned"),
  throw: (value) => console.log("subject2 threw", value),
});

subject1.next(1); // subject2 received 1 from subject1
subject2.next(2); // subject1 received 2 from subject2
subject2.return(); // subject2 returned
subject1.next(3); // No console output since subject2 is already returned
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
