# @observable/keep-alive

Converts an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an `AsyncIterable`.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { asAsyncIterable } from "@observable/as-async-iterable";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

for await (const value of pipe(of([1, 2, 3]), asAsyncIterable())) {
  console.log(value);
}

// Console output:
// 1
// 2
// 3
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
