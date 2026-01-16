# @observable/async-subject

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that buffers the most recent
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value until
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return) is called. Once
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)ed,
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next) will be replayed to late
[`consumers`](https://jsr.io/@observable/core#consumer) upon
[`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Example

```ts
import { AsyncSubject } from "@observable/async-subject";

const subject = new AsyncSubject<number>();
const controller = new AbortController();

subject.next(1);
subject.next(2);

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

subject.next(3);

subject.return();

// Console output:
// "next" 3
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
