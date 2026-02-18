# [@observable/tap](https://jsr.io/@observable/tap)

Performs a side-effect for each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed
value from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { tap } from "@observable/tap";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const activeSubscriptionController = new AbortController();

pipe(
  [1, 2, 3],
  ofIterable(),
  tap((value) => console.log("tap", value)),
).subscribe({
  signal: activeSubscriptionController.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap" 1
// "next" 1
// "tap" 2
// "next" 2
// "tap" 3
// "next" 3
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/tap from the @observable library ecosystem.

WHAT IT DOES:
`tap()` performs side-effects on each value emitted by the source Observable without modifying the values. Useful for debugging, logging, or triggering external actions. It takes a callback function `(value, index) => void` that is called for each value.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `tap` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { tap } from "@observable/tap";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  [1, 2, 3],
  ofIterable(),
  tap((value, index) => console.log(`Value ${value} at index ${index}`)),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("received:", value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});

// Console output:
// Value 1 at index 0
// received: 1
// Value 2 at index 1
// received: 2
// Value 3 at index 2
// received: 3
// done
```

KEY POINTS:
- The callback receives the value AND the index (0-based)
- Values pass through unchanged to downstream observers
- If the callback throws, the Observable throws
- Side-effect executes BEFORE the value reaches downstream consumers
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
