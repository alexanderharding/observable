# [@observable/throttle](https://jsr.io/@observable/throttle)

Throttles the emission of values from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) by the specified number of
milliseconds.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { throttle } from "@observable/throttle";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();

pipe(source, throttle(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source.next(1); // Emitted immediately
source.next(2); // Ignored (within throttle window)
source.next(3); // Ignored (within throttle window)

// After 100ms, the next value will be emitted
source.next(4); // Emitted after throttle window

// Console output:
// "next" 1
// (after 100ms)
// "next" 4
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
