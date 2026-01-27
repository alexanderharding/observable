# [@observable/switch-map](https://jsr.io/@observable/switch-map)

Projects each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) to an inner
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable),
[subscribing](https://jsr.io/@observable/core/doc/~/Observable.subscribe) only to the most recently
projected inner [`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and canceling any
previous inner [subscription](https://jsr.io/@observable/core#subscription).

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { switchMap } from "@observable/switch-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observableLookup = {
  1: of([1, 2, 3]),
  2: of([4, 5, 6]),
  3: of([7, 8, 9]),
} as const;

pipe(of([1, 2, 3]), switchMap((value) => observableLookup[value])).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/switch-map from the @observable library ecosystem.

WHAT IT DOES:
`switchMap(project)` projects each source value to an Observable, subscribing to only the most recent inner Observable and canceling previous ones. Ideal for search-as-you-type, route changes, etc.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `switchMap` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { switchMap } from "@observable/switch-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  of([1, 2, 3]),
  switchMap((id) => fetchUser(id))  // Only latest request matters
).subscribe({
  signal: controller.signal,
  next: (user) => console.log(user),
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

CANCELLATION BEHAVIOR:
When a new source value arrives, the previous inner Observable is automatically unsubscribed:
```ts
pipe(
  searchInput,
  debounce(300),
  switchMap((query) => searchApi(query))  // Previous search canceled
).subscribe({ ... });
```

SYNCHRONOUS EXAMPLE:
```ts
const lookup = { 1: of([1, 2, 3]), 2: of([4, 5, 6]), 3: of([7, 8, 9]) };
pipe(
  of([1, 2, 3]),
  switchMap((key) => lookup[key])
).subscribe({ ... });
// Only emits: 7, 8, 9 (from the last Observable)
```

SEE ALSO:
- `mergeMap` — subscribes to all inner Observables concurrently
- `flatMap` — subscribes to inner Observables sequentially
- `exhaustMap` — ignores new values while inner Observable is active
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
