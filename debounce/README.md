# @observable/debounce

Debounces the emission of values from the [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) by the specified number of
milliseconds.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { debounce } from "@observable/debounce";
import { Subject } from "@observable/core";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source = new Subject<number>();

pipe(source, debounce(100)).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source.next(1);
source.next(2);
source.next(3); // Only this value will be emitted after 100ms

// Console output (after 100ms):
// "next" 3
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
