# [@observable/await-value](https://jsr.io/@observable/await-value)

Projects a
[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
to an [`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Examples

```ts
import { awaitValue } from "@observable/await-value";
import { pipe } from "@observable/pipe";

awaitValue(Promise.resolve(42)).subscribe({
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
import { awaitValue } from "@observable/await-value";

awaitValue(Promise.reject(new Error("test"))).subscribe({
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

````
You are helping me with code that uses @observable/await-value from the @observable library ecosystem.

WHAT IT DOES:
`awaitValue(promise)` converts a Promise/PromiseLike into an Observable that emits the resolved value, then calls `return()`. If the promise rejects, it calls `throw()` with the error.

CRITICAL DIFFERENCES FROM RxJS:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `awaitValue` is a standalone factory — pass it a Promise to get an Observable

USAGE PATTERN:
```ts
import { awaitValue } from "@observable/await-value";

awaitValue(fetch("/api/data")).subscribe({
  signal: new AbortController().signal,
  next: (response) => console.log(response),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

ERROR HANDLING:
```ts
awaitValue(Promise.reject(new Error("failed"))).subscribe({
  signal: new AbortController().signal,
  next: (value) => console.log(value),
  return: () => console.log("done"),
  throw: (error) => console.error("Caught:", error), // Caught: Error: failed
});
```
````

## Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
