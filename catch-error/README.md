# [@observable/catch-error](https://jsr.io/@observable/catch-error)

Projects each [`throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)n value from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to a new
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { catchError } from "@observable/catch-error";
import { throwError } from "@observable/throw-error";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe(
  throwError(new Error("error")),
  catchError(() => pipe(["fallback"], ofIterable())),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" "fallback"
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/catch-error from the @observable library ecosystem.

WHAT IT DOES:
`catchError(handler)` catches errors (thrown values) from the source Observable and returns a new Observable to continue the stream. Similar to try/catch for Observables.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `catchError` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { catchError } from "@observable/catch-error";
import { throwError } from "@observable/throw-error";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  throwError(new Error("something went wrong")),
  catchError((error) => pipe(["fallback value"], ofIterable()))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // "fallback value"
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

HANDLER RECEIVES THE ERROR:
```ts
pipe(
  someObservable,
  catchError((error) => {
    console.error("Caught:", error);
    // Return a fallback Observable
    return pipe(["default"], ofIterable());
  })
).subscribe({ ... });
```

RE-THROWING ERRORS:
```ts
import { throwError } from "@observable/throw-error";

pipe(
  someObservable,
  catchError((error) => {
    if (error instanceof RecoverableError) {
      return pipe(["recovered"], ofIterable());
    }
    // Re-throw unrecoverable errors
    return throwError(error);
  })
).subscribe({ ... });
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
