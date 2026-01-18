# @observable/timer

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s a successful execution code (`0`)
after a specified number of milliseconds and then
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { timer } from "@observable/timer";

const controller = new AbortController();
timer(1_000).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" 0
// "return"
```

## Synchronous completion with 0ms

```ts
import { timer } from "@observable/timer";

const controller = new AbortController();
timer(0).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "next" 0
// "return"
```

## Edge cases

```ts
import { timer } from "@observable/timer";

const controller = new AbortController();

// Negative values return immediately
timer(-1).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (synchronously):
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
