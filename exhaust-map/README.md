# [@observable/exhaust-map](https://jsr.io/@observable/exhaust-map)

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
import { timeout } from "@observable/timeout";
import { map } from "@observable/map";

const controller = new AbortController();
const source = of([1, 2, 3]);

pipe(
  source,
  exhaustMap((value) => pipe(timeout(100), map(() => value))),
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

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/exhaust-map from the @observable library ecosystem.

WHAT IT DOES:
`exhaustMap(project)` projects source values to an Observable, but ignores new source values while an inner Observable is still active. Ideal for preventing duplicate submissions.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `exhaustMap` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { exhaustMap } from "@observable/exhaust-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import { timeout } from "@observable/timeout";
import { map } from "@observable/map";

const controller = new AbortController();

pipe(
  of([1, 2, 3]),  // Rapid clicks
  exhaustMap((value) => pipe(
    timeout(100),
    map(() => value)
  ))
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // Only: 1
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

PREVENT DOUBLE-SUBMIT:
```ts
pipe(
  submitButton,
  exhaustMap(() => saveForm())  // Ignores clicks while saving
).subscribe({
  next: () => console.log("Saved!"),
  ...
});
```

BEHAVIOR:
- First source value starts an inner Observable
- While inner Observable is active, new source values are ignored
- After inner Observable returns, next source value is processed

SEE ALSO:
- `switchMap` — cancels previous inner Observable when new value arrives
- `mergeMap` — subscribes to all inner Observables concurrently
- `flatMap` — subscribes to inner Observables sequentially
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
