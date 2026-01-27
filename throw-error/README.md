# [@observable/throw-error](https://jsr.io/@observable/throw-error)

[`Throw`](https://jsr.io/@observable/core/doc/~/Observer.throw)s the given value immediately upon
[`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { throwError } from "@observable/throw-error";

const controller = new AbortController();

throwError(new Error("throw")).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value), // Never called
  return: () => console.log("return"), // Never called
  throw: (value) => console.log("throw", value), // Called immediately
});
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/throw-error from the @observable library ecosystem.

WHAT IT DOES:
`throwError(value)` creates an Observable that immediately calls `throw()` with the given value on subscribe. No values are emitted.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`

USAGE PATTERN:
```ts
import { throwError } from "@observable/throw-error";

const controller = new AbortController();

throwError(new Error("Something went wrong")).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),    // Never called
  return: () => console.log("done"),       // Never called
  throw: (error) => console.error(error), // Called immediately
});
// Output: Error: Something went wrong
```

COMMON USE — Conditional errors:
```ts
import { pipe } from "@observable/pipe";
import { flatMap } from "@observable/flat-map";

pipe(
  of([userId]),
  flatMap((id) =>
    id ? fetchUser(id) : throwError(new Error("User ID required"))
  )
).subscribe({ ... });
```

COMMON USE — Re-throwing in catchError:
```ts
import { catchError } from "@observable/catch-error";

pipe(
  someObservable,
  catchError((error) => {
    if (isRecoverable(error)) {
      return fallbackObservable;
    }
    return throwError(error);  // Re-throw
  })
).subscribe({ ... });
```

SEE ALSO:
- `empty` — returns immediately without emitting
- `never` — never emits and never returns
- `catchError` — catches thrown errors
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
