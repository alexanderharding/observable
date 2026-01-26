# [@observable/behavior-subject](https://jsr.io/@observable/behavior-subject)

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that keeps track of its
current value and replays it to [`consumers`](https://jsr.io/@observable/core#consumer) upon
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
import { BehaviorSubject } from "@observable/behavior-subject";

const subject = new BehaviorSubject(0);
const controller = new AbortController();

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: () => console.error("throw"),
});

// Console output:
// "next" 0

subject.next(1);

// Console output:
// "next" 1

subject.return();

// Console output:
// "return"

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: () => console.error("throw"),
});

// Console output:
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/behavior-subject from the @observable library ecosystem.

WHAT IT DOES:
`BehaviorSubject` is a Subject that requires an initial value and replays the current (most recent) value to new subscribers immediately upon subscription.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Subject uses `next()`, `return()`, `throw()` — NOT `next()`, `complete()`, `error()`

USAGE PATTERN:
```ts
import { BehaviorSubject } from "@observable/behavior-subject";

const subject = new BehaviorSubject(0);  // Initial value required
const controller = new AbortController();

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // Immediately: 0
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

subject.next(1);  // logs: 1
subject.next(2);  // logs: 2

// New subscriber gets current value immediately
subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log("New:", value),  // Immediately: "New:" 2
  ...
});

subject.return();  // Both subscribers: "done"
```

AFTER RETURN:
New subscribers to a BehaviorSubject that has already returned receive only `return()`:
```ts
subject.return();
subject.subscribe({
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),     // Called immediately
  ...
});
```

SEE ALSO:
- `Subject` — no replay, only future values
- `ReplaySubject` — replays N most recent values
- `AsyncSubject` — emits last value only on return
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
