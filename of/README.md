# @observable/of

Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that emits a
sequence of values in order on
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe) and then
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
import { of } from "@observable/of";

const controller = new AbortController();

of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "return"
```

## Example with early unsubscription

```ts
import { of } from "@observable/of";

let count = 0;
const controller = new AbortController();

of([1, 2, 3]).subscribe({
  signal: controller.signal,
  next(value) {
    console.log("next", value);
    if (value === 2) controller.abort();
  },
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 1
// "next" 2
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
