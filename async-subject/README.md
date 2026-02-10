# [@observable/async-subject](https://jsr.io/@observable/async-subject)

A variant of [`Subject`](https://jsr.io/@observable/core/doc/~/Subject) that buffers the most recent
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value until immediately before
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return) is called.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

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
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/async-subject from the @observable library ecosystem.

WHAT IT DOES:
`AsyncSubject` is a Subject that only emits the last value, and only when `return()` is called. No values are emitted until `return()` is called.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Subject uses `next()`, `return()`, `throw()` — NOT `next()`, `complete()`, `error()`

USAGE PATTERN:
```ts
import { AsyncSubject } from "@observable/async-subject";

const subject = new AsyncSubject<number>();
const controller = new AbortController();

subject.next(1);  // Buffered, not emitted yet
subject.next(2);  // Replaces buffer, not emitted yet

subject.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// Nothing logged yet

subject.next(3);  // Replaces buffer, not emitted yet

subject.return();  // NOW emits: 3, then "done"
```

NEW CONSUMER AFTER RETURN:
Subscribing to an AsyncSubject that has already returned immediately receives `return()` only (no value):
```ts
subject.subscribe({
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),     // Called immediately
  ...
});
// Output: "done"
```

USE CASE:
Like a Promise — only the final result matters:
```ts
const result = new AsyncSubject<Response>();
// ... long running operation ...
result.next(finalResponse);
result.return();  // Now all consumers receive the response
```

SEE ALSO:
- `Subject` — no replay, only future values
- `BehaviorSubject` — requires initial value, replays current value
- `ReplaySubject` — replays N most recent values
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
