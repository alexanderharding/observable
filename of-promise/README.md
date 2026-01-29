# [@observable/of-promise](https://jsr.io/@observable/of-promise)

Projects a
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
through an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { ofPromise } from "@observable/of-promise";
import { pipe } from "@observable/pipe";

pipe(Promise.resolve(42), ofPromise()).subscribe({
  signal: new AbortController().signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "next" 42
// "return"
```

```ts
import { ofPromise } from "@observable/of-promise";
import { pipe } from "@observable/pipe";

pipe(Promise.reject(new Error("test")), ofPromise()).subscribe({
  signal: new AbortController().signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.error("throw", value),
});

// Console output:
// "throw" Error: test
```

## AI Prompt

Use the following prompt with AI assistants to help them understand this library:

> You are helping me with code that uses @observable/of-promise from the @observable library
> ecosystem.
>
> WHAT IT DOES: `ofPromise()` converts a Promise/PromiseLike into an Observable that emits the
> resolved value, then calls `return()`. If the promise rejects, it calls `throw()` with the error.
>
> CRITICAL: This library is NOT RxJS. Key differences:
>
> - Observer uses `return`/`throw` — NOT `complete`/`error`
> - Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
> - `ofPromise` is an operator function used with `pipe()` — NOT a standalone factory

### Usage Pattern

```ts
import { ofPromise } from "@observable/of-promise";
import { pipe } from "@observable/pipe";

pipe(fetch("/api/data"), ofPromise()).subscribe({
  signal: new AbortController().signal,
  next: (response) => console.log(response),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

### Error Handling

```ts
pipe(
  Promise.reject(new Error("failed")),
  ofPromise(),
).subscribe({
  signal: new AbortController().signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error("Caught:", error), // Caught: Error: failed
});
```

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
