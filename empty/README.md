# [@observable/empty](https://jsr.io/@observable/empty)

Immediately [`return`](https://jsr.io/@observable/core/doc/~/Observer.return)s each
[`Observer`](https://jsr.io/@observable/core/doc/~/Observer) on
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
import { empty } from "@observable/empty";

const controller = new AbortController();

empty.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/empty from the @observable library ecosystem.

WHAT IT DOES:
`empty` is an Observable constant that immediately calls `return()` on subscribe without emitting any values. Useful as a no-op or to signal early return.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `empty` is a constant, not a function — use as `empty` not `empty()`

USAGE PATTERN:
```ts
import { empty } from "@observable/empty";

const controller = new AbortController();

empty.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // Never called
  return: () => console.log("done"),    // Called immediately
  throw: (error) => console.error(error),
});
// Output: "done"
```

COMMON USE — Swallow errors:
```ts
import { catchError } from "@observable/catch-error";
import { pipe } from "@observable/pipe";

pipe(
  someObservable,
  catchError((error) => {
    console.log("Swallowing error:", error);
    return empty;  // Return without emitting
  })
).subscribe({ ... });
```

COMMON USE — Default case:
```ts
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const getObservable = (condition: boolean) =>
  condition ? pipe([1, 2, 3], ofIterable()) : empty;
```

SEE ALSO:
- `never` — never emits and never returns
- `throwError(value)` — immediately throws an error
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
