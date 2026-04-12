# [@observable/interval](https://jsr.io/@observable/interval)

Repeatedly [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a `void` value with a
fixed time delay between each call.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Positive integer milliseconds

```ts
import { interval } from "@observable/interval";
import { take } from "@observable/take";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(interval(1000), take(3)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" undefined
// Console output (after 2 seconds):
// "next" undefined
// Console output (after 3 seconds):
// "next" undefined
// "return"
```

0 milliseconds

```ts
import { interval } from "@observable/interval";
import { take } from "@observable/take";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(interval(0), take(3)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" undefined
// "next" undefined
// "next" undefined
// "return"
```

Negative integer milliseconds

```ts
import { interval } from "@observable/interval";

const controller = new AbortController();
interval(-1).subscribe({
  signal: controller.signal,
  next: () => console.log("next"),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

NaN milliseconds

```ts
import { interval } from "@observable/interval";

const controller = new AbortController();
interval(NaN).subscribe({
  signal: controller.signal,
  next: () => console.log("next"),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

Infinity milliseconds

```ts
import { interval } from "@observable/interval";

const controller = new AbortController();
interval(Infinity).subscribe({
  signal: controller.signal,
  next: () => console.log("next"),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// No console output
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/interval from the @observable library ecosystem.

WHAT IT DOES:
`interval(ms)` creates an Observable that repeatedly emits `void` at the specified interval. Never returns on its own — use operators like `take()` to limit.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- Emits `void` — NOT sequential integers like RxJS

USAGE PATTERN:
```ts
import { interval } from "@observable/interval";
import { take } from "@observable/take";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  interval(1000),  // Emit every 1 second
  take(3)          // Take only 3 emissions
).subscribe({
  signal: controller.signal,
  next: () => console.log("tick"),  // Logs "tick" 3 times
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

EDGE CASE — 0ms INTERVAL:
```ts
// 0ms interval emits synchronously
let count = 0;
interval(0).subscribe({
  signal: controller.signal,
  next: () => {
    console.log("tick");
    if (++count === 3) controller.abort();  // Stop after 3
  },
  ...
});
// Immediately logs: "tick", "tick", "tick"
```

REMEMBER:
- `interval` never returns — always use `take()`, `takeUntil()`, or `abort()` to stop
- First emission is AFTER the interval (not immediately)

SEE ALSO:
- `timeout(ms)` — emits once after delay, then returns
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
