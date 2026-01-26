# [@observable/share](https://jsr.io/@observable/share)

Shares a single [subscription](https://jsr.io/@observable/core#subscription) to the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) projects it to all subscribers
through a [`Subject`](https://jsr.io/@observable/core/doc/~/Subject). Resets when all
[unsubscribe](https://jsr.io/@observable/core@0.3.0/doc/~/Observer.signal) or when the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)
[`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s or
[`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { share } from "@observable/share";
import { timeout } from "@observable/timeout";
import { pipe } from "@observable/pipe";

const shared = pipe(timeout(1_000), share());
const controller = new AbortController();
shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});
shared.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output (after 1 second):
// "next" 0
// "next" 0
// "return"
// "return"
```

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
