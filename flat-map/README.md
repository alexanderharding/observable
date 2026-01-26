# [@observable/flat-map](https://jsr.io/@observable/flat-map)

Projects each [source](https://jsr.io/@observable/core#source) value to an
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable) which is merged in the output
[`Observable`](https://jsr.io/@observable/core/doc/~/Observable), in a serialized fashion waiting
for each one to [`return`](https://jsr.io/@observable/core/doc/~/Observer.return) before merging the
next.

## Build

Automated by [JSR](https://jsr.io/)

## Publishing

Automated by `.github\workflows\publish.yml`.

## Running unit tests

Run `deno task test` or `deno task test:ci` to execute the unit tests via
[Deno](https://deno.land/).

## Example

```ts
import { flatMap } from "@observable/flat-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const source = of(["a", "b", "c"]);
const controller = new AbortController();
const observableLookup = {
  a: of([1, 2, 3]),
  b: of([4, 5, 6]),
  c: of([7, 8, 9]),
} as const;

pipe(source, flatMap((value) => observableLookup[value])).subscribe({
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
You are helping me with code that uses @observable/flat-map from the @observable library ecosystem.

WHAT IT DOES:
`flatMap(project)` projects each source value to an Observable and subscribes to them sequentially — waiting for each inner Observable to return before subscribing to the next. Also known as `concatMap` in RxJS.

CRITICAL: This library is NOT RxJS. Key differences:
- Observer uses `return`/`throw` — NOT `complete`/`error`
- Unsubscription via `AbortController.abort()` — NOT `subscription.unsubscribe()`
- `flatMap` is a standalone function used with `pipe()` — NOT a method on Observable
- This is called `flatMap` (like `concatMap` in RxJS), NOT `flatMap` from RxJS which is `mergeMap`

USAGE PATTERN:
```ts
import { flatMap } from "@observable/flat-map";
import { of } from "@observable/of";
import { pipe } from "@observable/pipe";

const controller = new AbortController();

const lookup = {
  a: of([1, 2, 3]),
  b: of([4, 5, 6]),
  c: of([7, 8, 9]),
};

pipe(
  of(["a", "b", "c"]),
  flatMap((key) => lookup[key])
).subscribe({
  signal: controller.signal,
  next: (value) => console.log(value),  // 1, 2, 3, 4, 5, 6, 7, 8, 9
  return: () => console.log("done"),
  throw: (error) => console.error(error),
});
```

SEQUENTIAL EXECUTION:
Each inner Observable returns before the next one starts:
```ts
pipe(
  of(["file1", "file2", "file3"]),
  flatMap((file) => uploadFile(file))  // Uploads one at a time
).subscribe({ ... });
```

SEE ALSO:
- `mergeMap` — subscribes to all inner Observables concurrently
- `switchMap` — cancels previous inner Observable when new value arrives
- `exhaustMap` — ignores new values while inner Observable is active
````

# Glossary And Semantics

[@observable/core](https://jsr.io/@observable/core#glossary-and-semantics)
