# [@observable/merge-map](https://jsr.io/@observable/merge-map)

Projects each [`next`](https://jsr.io/@observable/core/doc/~/Observer.next)ed value from the
[source](https://jsr.io/@observable/core#source)
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable)s.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { mergeMap } from "@observable/merge-map";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();
const observableLookup = {
  1: pipe([1, 2, 3], ofIterable()),
  2: pipe([4, 5, 6], ofIterable()),
  3: pipe([7, 8, 9], ofIterable()),
} as const;
pipe(
  [1, 2, 3],
  ofIterable(),
  mergeMap((value) => observableLookup[value]),
).subscribe({
  signal: controller.signal,
  next: (value) => console.log("next", value),
  return: () => console.log("return"),
  throw: (value) => console.log("throw", value),
});

// Console output:
// "next" 1
// "next" 2
// "next" 3
// "next" 4
// "next" 5
// "next" 6
// "next" 7
// "next" 8
// "next" 9
// "return"
```

# AI Prompt

Use the following prompt with AI assistants to help them understand this library:

````
You are helping me with code that uses @observable/merge-map from the @observable library ecosystem.

WHAT IT DOES:
`mergeMap(project)` projects each source value to an Observable and subscribes to all of them concurrently, merging their emissions into the output.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `mergeMap` is a standalone function used with `pipe()` — NOT a method on Observable

USAGE PATTERN:
```ts
import { mergeMap } from "@observable/merge-map";
import { ofIterable } from "@observable/of-iterable";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

const lookup = {
  1: pipe([1, 2, 3], ofIterable()),
  2: pipe([4, 5, 6], ofIterable()),
  3: pipe([7, 8, 9], ofIterable()),
};

pipe(
  [1, 2, 3],
  ofIterable(),
  mergeMap((key) => lookup[key])
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 4, 5, 6, 7, 8, 9
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

CONCURRENT EXECUTION:
All inner Observables run at the same time:
```ts
pipe(
  ["url1", "url2", "url3"],
  ofIterable(),
  mergeMap((url) => fetchData(url))  // All requests fire immediately
).subscribe({ ... });
```

WHEN TO USE:
- When order doesn't matter and you want maximum parallelism
- Fire-and-forget operations
- Independent async tasks

SEE ALSO:
- `flatMap` — subscribes to inner Observables sequentially (one at a time)
- `switchMap` — cancels previous inner Observable when new value arrives
- `exhaustMap` — ignores new values while inner Observable is active
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
