# @observable/exhaust-map

Projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) only if the previous projected
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) has
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)ed.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { exhaustMap } from "@observable/exhaust-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { timer } from "@observable/timer";
import { map } from "@observable/map";

const controller = new AbortController();
const source = of([1, 2, 3]);

pipe(
  source,
  exhaustMap((value) => pipe(timer(100), map(() => value))),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 100ms):
// "next" 1
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
