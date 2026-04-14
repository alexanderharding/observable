# [@observable/delay](https://jsr.io/@observable/delay)

Delays values by the given number of `milliseconds`.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

1000 milliseconds

```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), delay(1_000)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "return"
```

0 milliseconds

```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), delay(0)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "return"
```

Infinite milliseconds

```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), delay(Infinity)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

Negative milliseconds

```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), delay(-1)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

NaN milliseconds

```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3, 4, 5]), delay(NaN))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/delay from the @observable library ecosystem.

WHAT IT DOES:
`delay(milliseconds)` shifts each emitted value forward in time by scheduling it after `milliseconds` have elapsed. Values stay in the same order as the source.

CRITICAL: This library is NOT RxJS. Key differences:
- `delay` is a standalone function used with `pipe()` — NOT a method on Observable
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { delay } from "@observable/delay";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(of([1, 2, 3]), delay(1_000)).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

WRONG USAGE:
```ts
// ✗ WRONG: delay is NOT a method on Observable
of([1, 2, 3]).delay(1000)  // This does NOT work!
```

MILLISECONDS SEMANTICS:
- **Positive number:** each `next` is delayed by that many milliseconds; source order is preserved.
- **0:** values pass through without using timers (effectively immediate).
- **Negative or `NaN`:** the result is an empty Observable (no `next`; behaves like `@observable/empty`).
- **`Infinity`:** all values are dropped; when the source returns, the output returns (no delayed values).

ABORT / UNSUBSCRIBE:
Aborting the observer clears pending timers. After abort, fired timer callbacks must not deliver values to the consumer.

ARGUMENT VALIDATION:
`delay` requires a `number` for milliseconds. The returned operator function requires an Observable source; both throw `TypeError` if missing or wrong type.
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
