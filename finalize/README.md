# [@observable/finalize](https://jsr.io/@observable/finalize)

Registers a `callback` to be invoked on
[`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Return

```ts
import { finalize } from "@observable/finalize";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(forOf([1, 2, 3]), finalize(() => console.log("finalized"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "finalized"
// "return"
```

Throw

```ts
import { finalize } from "@observable/finalize";
import { throwError } from "@observable/throw-error";
import { pipe } from "@observable/pipe";
import { forOf } from "@observable/for-of";
import { flat } from "@observable/flat";

const controller = new AbortController();
const observable = flat([forOf([1, 2, 3]), throwError(new Error("error"))]);

pipe(observable, finalize(() => console.log("finalized"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "finalized"
// "throw" Error: error
```

Unsubscribe

```ts
import { finalize } from "@observable/finalize";
import { pipe } from "@observable/pipe";
import { never } from "@observable/never";

const controller = new AbortController();

pipe(never, finalize(() => console.log("finalized"))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

controller.abort();

// Console output:
// "finalized"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/finalize from the @observable library ecosystem.

WHAT IT DOES:
`finalize(teardown)` calls the teardown function when the subscription ends for ANY reason — `return()`, `throw()`, or unsubscription via `abort()`. Teardown runs BEFORE the terminal notification is delivered.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `finalize` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { finalize } from "@observable/finalize";
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  forOf([1, 2, 3]),
  finalize(() => console.log("finalized"))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("return"),
  throw: (error) => console.error("throw", error),
});
// Output:
// 1
// 2
// 3
// "finalized"
// "return"
```

CLEANUP ON UNSUBSCRIPTION:
```ts
pipe(
  interval(1000),
  finalize(() => console.log("Cleaned up!"))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  ...
});

controller.abort();  // Triggers: "Cleaned up!"
```

COMMON USE — Resource cleanup:
```ts
pipe(
  webSocketConnection,
  finalize(() => {
    console.log("Closing connection...");
    socket.close();
  })
).subscribe({ ... });
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
