# @observable/replay-subject

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that replays buffered
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed values upon
[`subscription`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { ReplaySubject } from "@observable/replay-subject";

const subject = new ReplaySubject<number>(3);
const controller = new AbortController();

subject.next(1); // Stored in buffer
subject.next(2); // Stored in buffer
subject.next(3); // Stored in buffer
subject.next(4); // Stored in buffer and 1 gets trimmed off

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 2
// "next" 3
// "next" 4

// Values pushed after the subscribe will emit immediately
// unless the subject is already finalized.
subject.next(5); // Stored in buffer and 2 gets trimmed off

// Console output:
// "next" 5

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 3
// "next" 4
// "next" 5
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
