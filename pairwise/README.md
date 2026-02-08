# [@observable/pairwise](https://jsr.io/@observable/pairwise)

[`Next`](https://jsr.io/@observable/core/doc/~/Observer.next)s pairs of consecutive values from the
[source](https://jsr.io/@observable/core#source)
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
import { pairwise } from "@observable/pairwise";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 3, 4], ofIterable(), pairwise()).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" [1, 2]
// "next" [2, 3]
// "next" [3, 4]
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/pairwise from the @observable library ecosystem.

WHAT IT DOES:
`pairwise()` emits pairs of consecutive values as arrays `[previous, current]`. Skips the first value since there's no previous value to pair with.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `pairwise` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { pairwise } from "@observable/pairwise";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  [1, 2, 3, 4],
  ofIterable(),
  pairwise()
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// Output:
// [1, 2]
// [2, 3]
// [3, 4]
// "done"
```

BEHAVIOR:
- First emission requires 2 source values
- Each subsequent emission slides the window by 1
- Useful for computing deltas or transitions

COMMON USE — Compute differences:
```ts
pipe(
  scrollPosition,
  pairwise(),
  map(([prev, curr]) => curr - prev)  // Scroll delta
).subscribe({ ... });
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
