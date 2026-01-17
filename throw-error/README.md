# @observable/throw-error

Creates an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that will
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) the given value immediately upon
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { throwError } from "@observable/throw-error";

const controller = new AbortController();

throwError(new Error("throw")).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value), // Never called
  return: () => console.log("return"), // Never called
  throw: (value) => console.log("throw", value), // Called immediately
});
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
