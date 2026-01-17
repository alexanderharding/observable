# @observable/merge

Creates and returns an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which
concurrently [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)s all values from every
given [source](https://jsr.io/@observable/core#source).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { merge } from "@observable/merge";
import { Subject } from "@observable/core";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const source1 = new Subject<number>();
const source2 = new Subject<number>();
const source3 = new Subject<number>();

merge([source1, source2, source3]).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

source1.next(1); // "next" 1
source2.next(2); // "next" 2
source3.next(3); // "next" 3
source1.return();
source1.next(4); // "next" 4
source2.return();
source2.next(5); // "next" 5
source3.return(); // "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
