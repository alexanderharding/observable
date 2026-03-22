# [@observable/for-of](https://jsr.io/@observable/for-of)

Projects an
[`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)
to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s each value in order, then
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

Populate array

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();
forOf([1, 2, 3]).subscribe({
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

Empty array

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();
forOf([]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output (synchronously):
// "return"
```

Iterable

```ts
import { forOf } from "@observable/for-of";

const controller = new AbortController();
forOf(new Set([1, 2, 1, 2, 3, 3])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output (synchronously):
// "next" 1
// "next" 2
// "next" 3
// "return"

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
```
