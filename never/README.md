# [@observable/never](https://jsr.io/@observable/never)

Does nothing on [`subscribe`](https://jsr.io/@observable/core/doc/~/Observable.subscribe).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { never } from "@observable/never";

const controller = new AbortController();

never.subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value), // Never called
  return: () => console.log("return"), // Never called
  throw: (value) => console.log("throw", value), // Never called
});
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/never from the @observable library ecosystem.

WHAT IT DOES:
`never` is an Observable constant that does nothing — never emits values, never returns, never throws. Subscription stays open indefinitely until aborted.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `never` is a constant, not a function — use as `never` not `never()`

USAGE PATTERN:
```ts
import { never } from "@observable/never";

const controller = new AbortController();

never.subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),    // Never called
  return: () => console.log("done"),       // Never called
  throw: (error) => console.error(error), // Never called
});

// Only way to end the subscription:
controller.abort();
```

COMMON USE — Testing infinite streams:
```ts
import { race } from "@observable/race";
import { timeout } from "@observable/timeout";

// Test that something wins against never
race([
  someObservable,
  never
]).subscribe({ ... });  // Will only emit if someObservable emits
```

COMMON USE — Keep-alive placeholder:
```ts
const observable = condition ? actualObservable : never;
```

SEE ALSO:
- `empty` — returns immediately without emitting
- `throwError(value)` — immediately throws an error
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
