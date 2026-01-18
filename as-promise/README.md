# [@observable/as-promise](https://jsr.io/@observable/as-promise)

Converts an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a `Promise`.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { asPromise } from "@observable/as-promise";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

console.log(await pipe(of([1, 2, 3]), asPromise()));

// Console output:
// 3
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
