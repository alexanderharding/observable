# @observable/keep-alive

Ignores [`unsubscribe`](https://jsr.io/@observable/core/doc/~/Observer.signal) indefinitely.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { keepAlive } from "@observable/keep-alive";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(of([1, 2, 3]), keepAlive()).subscribe({
  signal: controller.signal,
  next: (value) => {
    console.log("next", value);
    if (value === 2) controller.abort(); // Ignored
  },
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// console output:
// "next" 1
// "next" 2
// "next" 3
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
