# @observable/flat

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which sequentially emits
all values from the first given [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and
then moves on to the next.

## Build

Automated by [Deno](https://deno.land/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { flat } from "@observable/flat";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

flat([of([1, 2, 3]), of([4, 5, 6]), of([7, 8, 9])]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "next" 6
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
