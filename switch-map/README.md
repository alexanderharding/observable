# @observable/switch-map

Projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), emitting values only from the most
recently projected [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { switchMap } from "@observable/switch-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observableLookup = {
  1: of([1, 2, 3]),
  2: of([4, 5, 6]),
  3: of([7, 8, 9]),
} as const;

pipe(of([1, 2, 3]), switchMap((value) => observableLookup[value])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
