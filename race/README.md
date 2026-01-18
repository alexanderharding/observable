# [@observable/race](https://jsr.io/@observable/race)

Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) that mirrors
the first [source](https://jsr.io/@observable/core#source) to
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next) or
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw) a value.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { race } from "@observable/race";
import { Subject } from "@observable/core";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

race([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source2.next(1); // "next" 1
source1.next(2);
source3.next(3);
source1.return();
source2.next(4); // "next" 4
source2.return();
source3.next(5);
source2.return(); // "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
