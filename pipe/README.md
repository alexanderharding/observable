# @observable/pipe

Pipe a value through a series of unary functions.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { pipe } from "@observable/pipe";
import { of } from "@observable/of";
import { map } from "@observable/map";
import { filter } from "@observable/filter";

const controller = new AbortController();

pipe(
  of([1, 2, 3, 4, 5]),
  filter((value) => value % 2 === 0),
  map((value) => value * 2),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 4
// "next" 8
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
