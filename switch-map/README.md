# [@observable/switch-map](https://jsr.io/@observable/switch-map)

Projects each [source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)'s
[`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), switching to latest projected
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) and
[`unsubscribing`](https://jsr.io/@observable/core/doc/~/Observer.signal) the previous one.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { BehaviorSubject } from "@observable/behavior-subject";
import { switchMap } from "@observable/switch-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";
import type { Observable } from "@observable/core";

const page = new BehaviorSubject(1);
const controller = new AbortController();
pipe(page, switchMap((value) => of(`Page ${page}`))).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" "Page 1"

page.next(2);

// Console output:
// "next" "Page 2"

page.return();

// Console output:
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
import { forOf } from "@observable/for-of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

pipe(
  forOf([1, 2, 3]),
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
const lookup = { 1: forOf([1, 2, 3]), 2: forOf([4, 5, 6]), 3: forOf([7, 8, 9]) };
pipe(
  forOf([1, 2, 3]),
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
