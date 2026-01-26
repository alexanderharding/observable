# [@observable/rxjs-interop](https://jsr.io/@observable/rxjs-interop)

Utilities for converting an [RxJS Observable](https://rxjs.dev/api/index/class/Observable) to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and vice versa.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { asObservable } from "@observable/rxjs-interop";
import { of as rxJsOf } from "rxjs";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observable = pipe(rxJsOf(1, 2, 3), asObservable());
observable.subscribe({
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

```ts
import { asRxJsObservable } from "@observable/rxjs-interop";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observable = pipe(of([1, 2, 3]), asRxJsObservable());
const subscription = observable.subscribe({
  next: (value) => console.log("next", value),
  complete: () => console.log("complete"),
  error: (value) => console.error("error", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "complete"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
