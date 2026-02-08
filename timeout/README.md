# [@observable/timeout](https://jsr.io/@observable/timeout)

[`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a `void` value after a specified
number of milliseconds and then [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { timeout } from "@observable/timeout";

const controller = new AbortController();
timeout(1_000).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" undefined
// "return"
```

## Synchronous return with 0ms

```ts
import { timeout } from "@observable/timeout";

const controller = new AbortController();
timeout(0).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" undefined
// "return"
```

## Edge cases

```ts
import { timeout } from "@observable/timeout";

const controller = new AbortController();

// Negative values return immediately
timeout(-1).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/timeout from the @observable library ecosystem.

WHAT IT DOES:
`timeout(ms)` creates an Observable that emits `undefined` (void) after the specified delay, then returns. Like a single-shot timer.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- This `timeout` creates a timer — different from RxJS `timeout` which throws on delay

USAGE PATTERN:
```ts
import { timeout } from "@observable/timeout";

const controller = new AbortController();

timeout(1_000).subscribe({
  signal: controller.signal,
  next: () => console.log("tick"),  // undefined (after 1 second)
  return: () => console.log("done"),    // Called after emission
  throw: (error) => console.error(error),
});
```

EDGE CASES:
```ts
// 0ms timeout emits synchronously
timeout(0).subscribe({ ... });  // Emits undefined immediately

// Negative values return immediately without emitting
timeout(-1).subscribe({
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),    // Called immediately
  ...
});
```

COMMON USE — Delay an action:
```ts
import { map } from "@observable/map";
import { pipe } from "@observable/pipe";

pipe(
  timeout(500),
  map(() => "delayed value")
).subscribe({
  next: (value) => console.log(value),  // "delayed value" after 500ms
  ...
});
```

SEE ALSO:
- `interval(ms)` — emits repeatedly at interval
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
