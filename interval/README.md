# [@observable/interval](https://jsr.io/@observable/interval)

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that emits an index
value after a specific number of milliseconds, repeatedly.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

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
// "next" 0
// Console output (after 2 seconds):
// "next" 1
// Console output (after 3 seconds):
// "next" 2
// "return"
```

## Edge cases

```ts
import { interval } from "@observable/interval";

const controller = new AbortController();

// 0ms interval emits synchronously
interval(0).subscribe({
  signal: controller.signal,
  next: (value) => {
    console.log("next", value);
    if (value === 2) controller.abort();
  },
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" 0
// "next" 1
// "next" 2
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
