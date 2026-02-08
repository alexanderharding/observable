# [@observable/keep-alive](https://jsr.io/@observable/keep-alive)

Ignores [`abort`](https://jsr.io/@observable/core/doc/~/Observer.signal) indefinitely.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { keepAlive } from "@observable/keep-alive";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
pipe([1, 2, 3], ofIterable(), keepAlive()).subscribe({
  signal: controller.signal,
  next: (value) => {
    console.log("next", value);
    if (value === 2) controller.abort(); // Ignored
  },
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/keep-alive from the @observable library ecosystem.

WHAT IT DOES:
`keepAlive()` ignores abort signals (`abort()`), keeping the source observation alive until the source naturally returns or throws.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `keepAlive` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { keepAlive } from "@observable/keep-alive";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  [1, 2, 3],
  ofIterable(),
  keepAlive()
).subscribe({
  signal: controller.signal,
  next: (value) => {
    console.log(value);
    if (value === 2) controller.abort();  // Ignored!
  },
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
// Output: 1, 2, 3, "done"
// Note: abort() at value 2 was ignored
```

WARNING:
Use with caution! This prevents normal cleanup:
- `controller.abort()` has no effect
- Observation continues until source returns
- Could cause memory leaks if source never returns

COMMON USE — Critical operations:
```ts
pipe(
  criticalSaveOperation,
  keepAlive()  // Don't interrupt mid-save
).subscribe({ ... });
```
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
