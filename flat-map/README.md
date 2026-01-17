# @observable/flat-map

Projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), in a serialized fashion waiting
for each one to [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) before merging the
next.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { flatMap } from "@observable/flat-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const source = of(["a", "b", "c"]);
const controller = new AbortController();
const observableLookup = {
  a: of([1, 2, 3]),
  b: of([4, 5, 6]),
  c: of([7, 8, 9]),
} as const;

pipe(source, flatMap((value) => observableLookup[value])).subscribe({
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
