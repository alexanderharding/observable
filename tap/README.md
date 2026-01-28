# [@observable/tap](https://jsr.io/@observable/tap)

Performs side-effects on the [source](https://jsr.io/@observable/core#source)
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

const subscriptionController = new AbortController();
const tapController = new AbortController();

pipe(
  [1, 2, 3],
  ofIterable(),
  tap({
    signal: tapController.signal,
    next(value) {
      if (value === 2) tapController.abort();
      console.log("tap next", value);
    },
    return: () => console.log("tap return"),
    throw: (value) => console.log("tap throw", value),
  }),
).subscribe({
  signal: subscriptionController.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "tap next" 1
// "next" 1
// "tap next" 2
// "next" 2
// "next" 3
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/tap from the @observable library ecosystem.

WHAT IT DOES:
`tap()` performs side-effects on the source Observable without modifying the values. Useful for debugging, logging, or triggering external actions.

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
  tap({
    signal: controller.signal,
    next: (value) => console.log("tapped:", value),
    return: () => console.log("tap return"),
    throw: (error) => console.error("tap error:", error),
  }),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("received:", value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

TAP HAS ITS OWN SIGNAL:
The tap observer can have its own AbortController, allowing you to stop tapping without stopping the subscription:
```ts
const tapController = new AbortController();
const subscriptionController = new AbortController();

pipe(
  source,
  tap({
    signal: tapController.signal,  // Independent control
    next: (value) => { if (value === 2) tapController.abort(); },
  }),
).subscribe({
  signal: subscriptionController.signal,
  next: (value) => console.log(value),  // Still receives all values
  ...
});
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
