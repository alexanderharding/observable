# [@observable/delay](https://jsr.io/@observable/delay)

Drops the first `count` values [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed by
the [source](https://jsr.io/@observable/core#source).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

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

```
# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
```
