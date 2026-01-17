# @observable/defer

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that, on
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe), calls an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) factory to get an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) for each
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer).

## Build

Automated by [Deno](https://deno.land/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { defer } from "@observable/defer";
import { of } from "@observable/of";

const controller = new AbortController();
let values = [1, 2, 3];
const observable = defer(() => of(values));

observable.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// console output:
// "next" 1
// "next" 2
// "next" 3
// "return"

values = [4, 5, 6];
observable.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// console output:
// "next" 4
// "next" 5
// "next" 6
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
