# @observable/behavior-subject

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that keeps track of its
current value and replays it to [`consumers`](https://jsr.io/@observable/core#consumer) upon
[`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Example

```ts
import { BehaviorSubject } from "@observable/behavior-subject";

const subject = new BehaviorSubject(0);
const controller = new AbortController();

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: () => console.error("throw"),
});

// console output:
// "next" 0

subject.next(1);

// console output:
// "next" 1

subject.return();

// console output:
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: () => console.error("throw"),
});

// console output:
// "next" 1
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
